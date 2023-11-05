import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";
import { auth } from "auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { postId } = req.body;

  if (req.method !== "DELETE") {
    return res.status(405).end();
  }
  const session = await auth(req, res);

  if (session?.user.role != "admin") {
    return res.status(401).end();
  }

  if (!session) {
    return res.status(401).end();
  }
  const client = await clientPromise;
  const db = client.db();
  console.log(postId);
  const result = await db
    .collection("alertposts")
    .deleteOne({ _id: new ObjectId(postId) });
  console.log(result);
  return res.status(200).json({ message: "Post deleted" });
}
