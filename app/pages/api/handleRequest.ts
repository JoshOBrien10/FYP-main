import { auth } from "auth";
import clientPromise from "lib/mongodb";
import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = await clientPromise;
  const db = client.db();

  if (req.method !== "POST") {
    return res.status(405).end();
  }
  const session = await auth(req, res);

  if (session?.user.role != "admin") {
    return res.status(401).end();
  }
  const { requestId, isApproved, userId } = req.body;
console.log(req)
  if (!requestId) {
    return res.status(400).send("Request ID is required");
  }

  const newStatus = isApproved ? "approved" : "rejected";

  await db
    .collection("verifyrequests")
    .updateOne({ _id: new ObjectId(requestId) }, { $set: { status: newStatus } });

  if (isApproved) {
    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(userId) },
        { $set: { role: "org", verifyStatus: "approved" } }
      );
  } else {
    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(userId) },
        { $set: { verifyStatus: "declined" } }
      );
  }

  return res.status(200).send(`Request ${newStatus}`);
}
