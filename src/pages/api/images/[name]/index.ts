import { NextApiRequest, NextApiResponse } from "next";
import { createBucketReadStream } from "@/lib/cloud";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method != "GET") return res.status(405);
  const name = req.query.name! as string;

  (await createBucketReadStream(name)).pipe(res)

  res.status(200);
}
