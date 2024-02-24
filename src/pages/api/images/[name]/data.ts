import { NextApiRequest, NextApiResponse } from "next";
import { createBucketReadStream } from "@/lib/cloud";
import { getImageData } from "@/lib/prisma";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method != "GET") return res.status(405);
  const name = req.query.name! as string;

  const data = await getImageData(name)
  res.json(data)
  res.status(200);
}

