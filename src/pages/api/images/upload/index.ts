import parseForm from "@/lib/parseForm";
import formidable from "formidable-serverless";
import { NextApiRequest, NextApiResponse } from "next";
import { PictureGroupUpload, uploadImages } from "@/lib/prisma";
import { registerUpload } from "./progress/[id]";
import { getServerSession } from "next-auth";
import { hashUpload } from "@/lib/utils";
import { options } from "@/pages/api/auth/[...nextauth]"

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function POST(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, options) as any
  console.log(session)
  const email = session!.token?.token.user?.email
  console.log(session)
  if (!session || !email) {
    res.status(401)
    res.end()
    return
  }
  const form = formidable({
    multiples: true,
  });

  const { fields, files } = await parseForm(form, req);

  const upload: PictureGroupUpload = {
    name: fields.groupName,
    description: fields.description,
    keywords: Array.from(typeof(files.keywords) === "string" ? [fields.keywords] : fields.keywords ?? [] as any),
    images: Array.from(
      Array.isArray(files.images) ? files.images : [files.images]
    ),
    start: fields.start as any as Date,
    end: fields.end as any as Date,
    location: fields.location,
  } as any;
  let hash = hashUpload(upload)

  registerUpload(email, hash).then(async (callback) => {
    await uploadImages(upload, callback);
    console.log("All images uploaded")
  })
  setTimeout(() => {
    res.send(hash)
  }, 500);
}
