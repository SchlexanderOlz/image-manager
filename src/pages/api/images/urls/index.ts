import { ImageFilterQuery, db } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  const session = (await getServerSession(req, res, options)) as any;
  let query = { ...(req.query as any), email: undefined };
  if (query.user) {
    delete query["user"];
    query.email = session.user.email;
  }
  const urls = (await db.getImageUrls(query as ImageFilterQuery)).map((e) => {
    return {
      url: `/api/images/${e.gcStorageName}`,
      height: e.height,
      width: e.width,
    };
  });

  res.status(200).json({ urls });
}
