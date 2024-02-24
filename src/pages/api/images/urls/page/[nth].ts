import { getImageUrls } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { useRouter } from "next/router";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method != "GET") return res.status(405);
  const nth = Number.parseInt(req.query.nth! as string);
  const urls = (await getImageUrls(nth)).map(e => {
    return {
      url: `/api/images/${e.gcStorageName}`,
      height: e.height,
      width: e.width,
    }
  }

  );

  res.status(200).json({ urls });
}
