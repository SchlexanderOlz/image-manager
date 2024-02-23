import parseForm from "@/lib/parseForm";
import { upload } from "@/lib/upload";
import formidable from "formidable-serverless";
import { NextApiRequest, NextApiResponse } from "next";
import { PictureGroupUpload, uploadImages } from "@/lib/prisma";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).send(`Method not allowed`);
    return;
  }
  const form = formidable({
    multiples: true,
  });

  const { fields, files } = await parseForm(form, req);

  const upload: PictureGroupUpload = {
    groupName: fields.groupName,
    description: fields.description,
    keywords: fields.keywords,
    images: Array.from(files.images),
  };
  console.log(upload.images);
  await uploadImages(upload);
  res.status(204).end();
}
