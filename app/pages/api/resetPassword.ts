import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import { CourierClient } from "@trycourier/courier";
import clientPromise from "lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed, expected POST" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const client = await clientPromise;
  const db = client.db();

  const user = await db.collection("users").findOne({ email });

  if (!user) {
    return res.status(400).json({ error: "Email not found" });
  }

  if(user.provider != "credientials")
  {
    return res.status(400).json({ error: "Account registered using Oauth" });
  }

  const resetToken = uuidv4();

  await db.collection("users").updateOne(
    { email },
    {
      $set: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: new Date(Date.now() + 30 * 60 * 1000), 
      },
    }
  );

  const courier = CourierClient({
    authorizationToken: process.env.COURIER_API_KEY,
  });
  try {
    const { requestId } = await courier.send({
      message: {
        to: { email: email },
        template: "9SZ1DY91R5MTWGJF6C9XJZMKY3S7",
        data: {
          link: `https://fyp-sable.vercel.app/reset/${resetToken}`,
        },
      },
    });
    console.log(`Email sent with request ID: ${requestId}`);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
  return res.status(200).json({ message: "Password reset email sent" });
}
