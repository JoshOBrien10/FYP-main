import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "lib/mongodb";
import argon2 from "argon2";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end(); 
  }

  const { password, token } = req.body;

  if (!password || !token) {
    return res.status(400).json({ error: "Password and token are required" });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

   const hashedPassword = await argon2.hash(password);

    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
        },
        $unset: {
          resetPasswordToken: "",
          resetPasswordExpires: "",
        },
      }
    );

    return res.status(200).json({ message: "Password successfully reset" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).end(); 
  }
}
