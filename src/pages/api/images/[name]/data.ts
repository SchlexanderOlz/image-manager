import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/prisma";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  const name = req.query.name! as string;

  const data = await db.getImageData(name);
  res.json(data);
  res.status(200);
}
