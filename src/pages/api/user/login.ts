import { getPrisma } from "@/lib/prisma-client";
import { SHA256 as sha256 } from "crypto-js";
import { NextApiRequest, NextApiResponse } from "next";

const hashPassword = (string: string) => {
  return sha256(string).toString();
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    await loginUserHandler(req, res);
  } else {
    return res.status(405);
  }
}
async function loginUserHandler(req: NextApiRequest, res: NextApiResponse) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "invalid inputs" });
  }
  let user = await getPrisma().user.findUnique({
    where: { email: email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      profilePic: true,
    },
  });
  if (user && user.password === hashPassword(password)) {
    const { password, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
  }
  return res.status(401).json({ message: "invalid credentials" });
}
