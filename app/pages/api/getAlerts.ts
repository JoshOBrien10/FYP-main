import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const client = await clientPromise;
  const db = client.db();

  const page =
    typeof req.query.page === "string" ? parseInt(req.query.page) : 1;
  const perPage = 20;
  const searchTerm =
    typeof req.query.searchTerm === "string" ? req.query.searchTerm : "";
  const level = typeof req.query.level === "string" ? req.query.level : "";
  const startDate =
    typeof req.query.startDate === "string" && req.query.startDate !== ""
      ? new Date(req.query.startDate)
      : null;
  const endDate =
    typeof req.query.endDate === "string" && req.query.endDate !== ""
      ? new Date(req.query.endDate)
      : null;

  const skip = (page - 1) * perPage;
  const limit = perPage;

  const searchCriteria: Record<string, any>[] = [];

  if (searchTerm) {
    searchCriteria.push({ title: new RegExp(searchTerm, "i") });
  }

  if (level &&level!="All") {
    searchCriteria.push({ alertLevel: level });
  }

  if (startDate && endDate) {
    searchCriteria.push({ publishedDate: { $gte: startDate, $lte: endDate } });
  } else if (startDate) {
    searchCriteria.push({ publishedDate: { $gte: startDate } });
  } else if (endDate) {
    searchCriteria.push({ publishedDate: { $lte: endDate } });
  }

  try {
    console.log(searchCriteria);
    const alerts = await db
      .collection("rssfeedentries")
      .find(searchCriteria.length ? { $and: searchCriteria } : {})
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db
      .collection("rssfeedentries")
      .countDocuments(searchCriteria.length ? { $and: searchCriteria } : {});

    return res.status(200).json({ alerts, total });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
