import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]";

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "PATCH") return PATCH(req, res);
  if (req.method === "DELETE") return DELETE(req, res);
  const name = req.query.name! as string;

  res.status(200);
  (await db.adapter.createReadStream(name)).pipe(res);
}

export async function PATCH(req: NextApiRequest, res: NextApiResponse) {
  const name = req.query.name! as string;
  let change = JSON.parse(req.body);
  if (change.groupname) db.switchGroup(name, change.groupname);
  delete change["groupname"];
  const instance = await db.updateImageByFileName(name, change);

  res.json(instance);
  res.status(200).end();
}

export async function DELETE(req: NextApiRequest, res: NextApiResponse) {
  const session = (await getServerSession(req, res, options)) as any;
  const name = req.query.name! as string;
  await db.deleteImageByFileName(name, session.user.email);

  res.status(204).end();
}
