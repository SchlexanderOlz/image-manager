import { ImageFilterQuery, getImageUrls, getImages } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  const query = req.query as any as ImageFilterQuery;
  const urls = (await getImageUrls(query)).map((e) => {
    return {
      url: `/api/images/${e.gcStorageName}`,
      height: e.height,
      width: e.width,
    };
  });

  res.status(200).json({ urls });
}
