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
    name: fields.groupName,
    description: fields.description,
    keywords: Array.from(typeof(files.keywords) === "string" ? [fields.keywords] : fields.keywords ?? []),
    images: Array.from(
      Array.isArray(files.images) ? files.images : [files.images]
    ),
    start: fields.start as Date,
    end: fields.end as Date,
    location: fields.location,
  };
  await uploadImages(upload);
  res.status(204).end();
}
