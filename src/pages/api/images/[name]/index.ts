import { NextApiRequest, NextApiResponse } from "next";
import { createBucketReadStream } from "@/lib/cloud";


export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  const name = req.query.name! as string;

  (await createBucketReadStream(name)).pipe(res)

  res.status(200);
}
