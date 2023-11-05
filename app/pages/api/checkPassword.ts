import { NextApiRequest, NextApiResponse } from "next";
import argon2 from "argon2";
import clientPromise from "lib/mongodb";
import { auth } from "auth";
import { ObjectId } from "mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed, expected POST" });
  }

  const session = await auth(req, res);

  if (!session) {
    return res.status(401).end();
  }
  const { password } = req.body;

  const client = await clientPromise;
  const db = client.db();

  const user = await db.collection("users").findOne( {_id: new ObjectId(session.user.id)});
  if (!user) {
    res.status(400).json({ error: "Authentication error" });
  }
  console.log(password);
  console.log(user);
  const isValid = await argon2.verify(user?.password, password);
  if (!isValid) {
    res.status(400).json({ error: "Incorrect password" });
  } else {
    res.status(201).json({ message: "password is correct" });
  }
}
