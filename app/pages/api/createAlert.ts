import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";
import { io } from "socket.io-client";
import { auth } from "auth";
import { CourierClient } from "@trycourier/courier";

const courier = CourierClient({
  authorizationToken: process.env.COURIER_API_KEY,
});

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

    if (!session?.user?.role || session.user.role !== "admin") {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const client = await clientPromise;
    const db = client.db();

    const alertData = req.body;
    if (!alertData.lat || !alertData.lng) {
      return res.status(400).json({ success: false, error: "Need location" });
    }
    alertData.publishedDate = new Date();
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + 7);
    alertData.toDate = toDate;
    const result = await db.collection("rssfeedentries").insertOne(alertData);
    console.log("MongoDB Insert Result: ", result);

    const users = await db.collection("users").find().toArray();
    const notificationPromises = [];
    for (const user of users) {
      const distance = haversineDistance(
        parseFloat(alertData.lat),
        parseFloat(alertData.lng),
        user.lat,
        user.lng
      );

      if (distance <= user.alertDistance && user.alertsEnabled) {
        try {
          notificationPromises.push(
            courier.send({
              message: {
                to: { email: user.email },
                template: "X8ZGFXGVPHMRCBPJ1XHQMPX2C905",
                data: {
                  level: alertData.alertLevel,
                  distance,
                  id: alertData._id,
                  type: getAlertType(alertData.alertType),
                },
              },
            })
          );
          notificationPromises.push(
            courier.send({
              message: {
                to: { phone_number: user.alertSMS },
                template: "4G99W2XQQE4TRSNHZV30Y74KPEB9",
                data: {
                  level: alertData.alertLevel,
                  id: alertData._id,
                  type: getAlertType(alertData.alertType),
                },
              },
            })
          );
        } catch (error) {
          console.error("Failed to send email:", error);
        }
      }
    }
    await Promise.all(notificationPromises);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Handler Error: ", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}

// Alert types mapping
const ALERT_TYPE_MAP: Record<string, string> = {
  EQ: "Earthquake",
  VO: "Volcano",
  TC: "Tornado",
  WF: "Wildfire",
  DR: "Drought",
  FL: "Flood",
  TS: "Tsunami",
};

function getAlertType(code: string): string {
  return ALERT_TYPE_MAP[code] || "Unknown Alert Type";
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
