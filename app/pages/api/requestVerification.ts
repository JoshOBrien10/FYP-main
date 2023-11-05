import clientPromise from "lib/mongodb";
import { getSession } from "next-auth/react";
import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { auth } from "auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { evidence } = req.body;
  console.log(req.body);
  const client = await clientPromise;
  const db = client.db();
  const session = await auth(req, res);

  if (!session) {
    return res.status(401).end();
  }
  const userId = session.user.id;
  const existingRequest = await db
    .collection("verifyrequests")
    .findOne({ userId, status: "pending" });
  if (existingRequest) {
    return res.status(400).json({
      error: "There's already a pending verification request for this user.",
    });
  }

  try {
    const requestResponse = await db.collection("verifyrequests").insertOne({
      userId,
      evidence,
      timestamp: new Date(),
      status: "pending",
    });
    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(userId) },
        { $set: { verifyStatus: "pending" } }
      );
    if (requestResponse.acknowledged) {
      res.status(200).json({ message: "Verification request submitted" });
    } else {
      res.status(500).json({ error: "Failed to submit verification request" });
    }
  } catch (error) {
    res.status(500).json({ error: `Database error: ${error}` });
  }
}
