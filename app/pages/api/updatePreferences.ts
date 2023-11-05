import clientPromise from "lib/mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import argon2 from "argon2";
import { ObjectId } from "mongodb";
import { auth } from "auth";

type RequestBody = {
  name: string;
  email: string;
  alertsEnabled: boolean;
  alertDistance: number;
  alertEmail: string;
  alertSMS: string;
  location: string;
  lat: number;
  lng: number;
  password?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const session = await auth(req, res);

  if (!session) {
    return res.status(401).end();
  }

  console.log("Received request body:", req.body);

  const {
    name,
    email,
    password,
    alertDistance,
    alertsEnabled,
    location,
    lat,
    lng,
    alertSMS,
    alertEmail,
  } = req.body as RequestBody;

  const client = await clientPromise;
  const db = client.db();

  try {
    let updateObject: Partial<RequestBody> = {};

if (name && name.trim() !== "") updateObject.name = name;
if (email && email.trim() !== "") updateObject.email = email;
if (typeof alertsEnabled === "boolean")
  updateObject.alertsEnabled = alertsEnabled;
if (typeof alertDistance === "number")
  updateObject.alertDistance = alertDistance;
if (location && location.trim() !== "") updateObject.location = location;
if (typeof lat === "number") updateObject.lat = lat;
if (typeof lng === "number") updateObject.lng = lng;
if (alertSMS && alertSMS.trim() !== "") updateObject.alertSMS = alertSMS;
if (alertEmail && alertEmail.trim() !== "")
  updateObject.alertEmail = alertEmail;
if (password && password.trim() !== "")
  updateObject.password = await argon2.hash(password);


    if (password) {
      updateObject.password = await argon2.hash(password);
    }
    console.log(updateObject);

    if (Object.keys(updateObject).length > 0) {
      const result = await db
        .collection("users")
        .updateOne(
          { _id: new ObjectId(session.user.id) },
          { $set: updateObject }
        );

      console.log("Database update result:", result);

      if (result.modifiedCount === 0) {
        console.warn(
          "No records were updated. Check if the provided email exists."
        );
      }

      return res.status(200).json({ message: "User preferences updated" });
    } else {
      console.warn("No valid fields to update.");
      return res.status(400).json({ message: "No valid fields to update." });
    }
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
