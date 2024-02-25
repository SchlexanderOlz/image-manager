import { getImageUrls } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function GET(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
