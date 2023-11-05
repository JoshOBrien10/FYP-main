import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";
import { auth } from "auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") {
      return res
        .status(405)
        .json({ success: false, error: "Method Not Allowed" });
    }

    const session = await auth(req, res);

    if (
      !session?.user?.role ||
      (session.user.role !== "admin" && session.user.role !== "org")
    ) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const client = await clientPromise;
    const db = client.db();

    const alertData = req.body;
    alertData.publishedDate = new Date();
    alertData.user = session.user.name;

    const result = await db.collection("alertposts").insertOne(alertData);
    console.log("MongoDB Insert Result: ", result);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Handler Error: ", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}
