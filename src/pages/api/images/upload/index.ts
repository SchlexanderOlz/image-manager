import { NextApiRequest, NextApiResponse } from "next";
import db, { PictureGroupUpload, adapter } from "@/lib/prisma";
import { getUploadFunction } from "./progress/[id]";
import { getServerSession } from "next-auth";
import { options } from "@/pages/api/auth/[...nextauth]";
import busboy from "busboy";
import { ImageUpload, UploadResult } from "@/lib/adapter";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  const session = (await getServerSession(req, res, options)) as any;
  const email = session!.user?.email;
  if (!session || !email) {
    res.status(401);
    res.end();
    return;
  }

  let uploadedFiles: Promise<UploadResult>[] = [];
  let upload: any = {
    keywords: [],
  };

  let resolveCuid = undefined;
  const cuid: Promise<string> = new Promise((res, _) => (resolveCuid = res));
  const bb = busboy({ headers: req.headers });
  let totalSize: number = Number.parseInt(req.headers["content-length"]!);
  let uploadedSize: number = 0;
  bb.on("file", async (_, stream, info) => {
    let uploadCallback = getUploadFunction(await cuid, email);
    let wrapper = async (progress: number) => {
      uploadedSize += progress;
      (await uploadCallback)(uploadedSize / totalSize);
    };
    const { mimeType, filename } = info;
    const uploadData: ImageUpload = {
      data: stream,
      name: filename,
      mimeType,
    };
    uploadedFiles.push(adapter.uploadFile(uploadData, wrapper));
  });
  bb.on("field", (name, value, _) => {
    if (name == "cuid") {
      resolveCuid!(value);
      return;
    }
    if (name == "totalSize") {
      totalSize = Number.parseInt(value);
      return;
    }
    if (name == "start" || name == "end") {
      upload = { ...upload, [name]: new Date(value) };
      return;
    }
    if (name == "keywords") {
      upload.keywords.push(value);
      return;
    }
    upload = { ...upload, [name]: value };
    console.log(upload);
  });
  bb.on("finish", async () => {
    const images = await Promise.all(uploadedFiles);
    upload = { ...upload, images: images, email: email };

    await db.uploadImages(upload as PictureGroupUpload);
    res.end();
  });
  await req.pipe(bb);
}
