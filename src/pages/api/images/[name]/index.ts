import { NextApiRequest, NextApiResponse } from "next";
import { createBucketReadStream } from "@/lib/cloud";
import { getImageByFileName, updateImageByFileName } from "@/lib/prisma";


export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "PATCH") return PATCH(req, res);
  const name = req.query.name! as string;

  (await createBucketReadStream(name)).pipe(res)

  res.status(200);
}

export async function PATCH(req: NextApiRequest, res: NextApiResponse) {
  const name = req.query.name! as string;
  const instance = await updateImageByFileName(name, JSON.parse(req.body))
  console.log(JSON.parse(req.body))

  console.log(instance)
  res.json(instance)
  res.status(200);
}

