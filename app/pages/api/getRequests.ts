import clientPromise from "../../lib/mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import { auth } from "auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }
  const session = await auth(req, res);

  if (session?.user.role != "admin") {
    return res.status(401).end();
  }
  const client = await clientPromise;
  const db = client.db();

  try {
    const requests = await db.collection("verifyrequests").find().toArray();

    const users = await Promise.all(
      requests.map((req: any) =>
        db.collection("users").findOne({ _id: new ObjectId(req.userId) })
      )
    );
    const combinedData = requests.map((request: any, index: number) => {
      const user = users[index];
      return {
        ...request,
        email: user?.email,
        name: user?.name,
      };
    });
    return res.status(200).json(combinedData);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}
