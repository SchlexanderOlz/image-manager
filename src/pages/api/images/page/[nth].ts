import { getImages } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { useRouter } from "next/router";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method != "GET") return res.status(405);
  const nth = Number.parseInt(req.query.nth! as string);
  const images = await getImages(nth);

  res.status(200).json({ images });
}
