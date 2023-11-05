import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";
import { auth } from "auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId, newRole } = req.body;

  if (req.method !== "PUT") {
    return res.status(405).end();
  }
  const session = await auth(req, res);

  if (session?.user.role != "admin") {
    return res.status(401).end();
  }
  const client = await clientPromise;
  const db = client.db();

  await db
    .collection("users")
    .updateOne({ _id: new ObjectId(userId) }, { $set: { role: newRole } });

  return res.status(200).json({ message: "User role updated" });
}
