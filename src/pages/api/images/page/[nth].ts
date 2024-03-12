import { getImages } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";


export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  const nth = Number.parseInt(req.query.nth! as string);
  const images = await getImages();

  res.status(200).json({ images });
}
