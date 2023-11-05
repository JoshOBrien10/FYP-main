import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";
import argon2 from "argon2";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed, expected POST" });
  }

  const { email, password, location, lat, lng, alertDistance, alertsEnabled, alertSMS, alertEmail } = req.body;

  if (!email || !password ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const client = await clientPromise;
  const db = client.db();

  const existingUser = await db.collection("users").findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await argon2.hash(password);

  const result = await db.collection("users").insertOne({
    email: email.toLowerCase(),
    password: hashedPassword,
    location,
    lat,
    lng,
    alertsEnabled,
    alertSMS,
    alertDistance,
    role: "user",
    verifyStatus: "none",
    alertEmail,
    provider: "credentials",
  });

 
  if (result.acknowledged) {
    const newUser = {
      _id: result.insertedId,
      email,
      location,
      lat,
      lng,
      alertDistance,
      role: "user",
      verifyStatus: "none",
    };
    console.log(newUser);
    res.status(201).json({ message: "User created", user: newUser });
  } else {
    res.status(500).json({ error: "Failed to create user" });
  }
}
