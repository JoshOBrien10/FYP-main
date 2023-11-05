import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";
import { auth } from "auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== "GET") {
    return res.status(405).end();
  }
  const session = await auth(req, res);

  if (session?.user.role!="admin") {
    return res.status(401).end();
  }

  const client = await clientPromise;
  const db = client.db();

  const users = await db.collection("users").find().toArray();

  const sanitizedUsers = users.map(({ password, ...rest }) => rest);

  return res.status(200).json(sanitizedUsers);
}
