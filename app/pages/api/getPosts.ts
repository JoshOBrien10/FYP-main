import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";

export default async function getPosts(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET") {
      return res
        .status(405)
        .json({ success: false, error: "Method Not Allowed" });
    }

    const { alertId } = req.query;

    if (!alertId) {
      return res
        .status(400)
        .json({ success: false, error: "Alert ID is required" });
    }

    const client = await clientPromise;
    const db = client.db();

    const posts = await db
      .collection("alertposts")
      .find({ alertId: alertId.toString() })
      .toArray();

    return res.status(200).json({ success: true, data: posts });
  } catch (error) {
    console.error("Handler Error: ", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}


