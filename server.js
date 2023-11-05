require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const axios = require("axios");
const xml2js = require("xml2js");
const cors = require("cors");
const { CourierClient } = require("@trycourier/courier");

const app = express();
const courier = CourierClient({
  authorizationToken: process.env.COURIER_API_KEY,
});

app.use(
  cors({
    origin: ["http://localhost:3000", "https://fyp-sable.vercel.app/"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
const PORT = process.env.PORT || 3010;

const server = http.createServer(app);
server.listen(PORT, () => {});
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://fyp-sable.vercel.app/"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

const RSS_FEED_URL = "https://www.gdacs.org/xml/rss.xml";

const RSSFeedEntry = mongoose.model("RSSFeedEntry", {
  title: String,
  description: String,
  link: String,
  publishedDate: Date,
  lat: Number,
  lng: Number,
  alertType: String,
  alertLevel: String,
  country: String,
  toDate: Date,
  alertScore: Number,
  population: Number
});

const UserEntry = mongoose.model("User", {
  email: String,
  lat: Number,
  lng: Number,
  alertDistance: Number,
  alertSMS: String,
  alertsEnabled: Boolean,
});

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    //testing rss section
/*
    //creating data for test alert
    const testAlert = {
      title: "test alert",
      description: "test entry",
      link: "test link",
      lat: -27.648500539619135,
      lng: 153.00537109375,
      alertType: "Fire",
      alertLevel: "Red",
      country: "Australia",
    };
    //recording time
    console.log(new Date())
    //triggering standard notification logic
    alertUsers(testAlert);*/
    setInterval(fetchRSSFeedAndStore, 10000);
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB:", err);
  });

function haversineDistance(lat1, lon1, lat2, lon2) {
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
  const distance = R * c;
  return distance;
}

async function alertUsers(dataPoint) {
  const users = await UserEntry.find({});
  for (let user of users) {
    const distance = haversineDistance(
      parseFloat(dataPoint.lat),
      parseFloat(dataPoint.lng),
      user.lat,
      user.lng
    );
    if (distance <= user.alertDistance && user.alertsEnabled) {
      sendEmail(user.email, dataPoint, distance);
      sendSMS(user.alertSMS, dataPoint);
    }
  }
}

async function fetchRSSFeedAndStore() {
  try {
    const response = await axios.get(RSS_FEED_URL);

    const rssDataXML = response.data;

    const parser = new xml2js.Parser({ explicitArray: false });
    const rssData = await parser.parseStringPromise(rssDataXML);


    for (let entry of rssData.rss.channel.item) {
      const dataPoint = {
        title: entry.title,
        description: entry.description,
        link: entry.link,
        publishedDate: new Date(entry.pubDate),
        lat: entry["geo:Point"]["geo:lat"],
        lng: entry["geo:Point"]["geo:long"],
        alertType: entry["gdacs:eventtype"],
        alertLevel: entry["gdacs:alertlevel"],
        country: entry["gdacs:country"],
        alertScore: entry["gdacs:alertscore"],
        toDate: new Date(entry["gdacs:todate"]),
        population: entry["gdacs:population"]
          ? entry["gdacs:population"].$.value
          : 0,
      };

      const existingEntry = await RSSFeedEntry.findOne({
        link: dataPoint.link,
      });

      if (!existingEntry) {
        const newEntry = new RSSFeedEntry(dataPoint);
        await newEntry.save();
        io.emit("newEntry", dataPoint);
        alertUsers(dataPoint);
      }
    }
    console.log("RSS Feed fetched and processed");
  } catch (error) {
    console.log("Error fetching or processing RSS Feed:", error);
  }
}
async function sendEmail(email, dataPoint, distance) {
  try {
    const { requestId } = await courier.send({
      message: {
        to: { email: email },
        template: "X8ZGFXGVPHMRCBPJ1XHQMPX2C905",
        data: {
          level: dataPoint.alertLevel,
          distance: distance,
          id: dataPoint._id,
          type: getAlertType(dataPoint.alertType),
        },
      },
    });
    console.log(`Email sent with request ID: ${requestId}`);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

async function sendSMS(alertSMS, dataPoint) {
  try {
    const { requestId } = await courier.send({
      message: {
        to: { phone_number: alertSMS },
        template: "4G99W2XQQE4TRSNHZV30Y74KPEB9",
        data: {
          level: dataPoint.alertLevel,
          id: dataPoint._id,
          type: getAlertType(dataPoint.alertType),
        },
      },
    });
    console.log(`SMS sent with request ID: ${requestId}`);
  } catch (error) {
    console.error("Failed to send SMS:", error);
  }
}

const ALERT_TYPE_MAP = {
  EQ: "Earthquake",
  VO: "Volcano",
  TC: "Tornado",
  WF: "Wildfire",
  DR: "Drought",
  FL: "Flood",
  TS: "Tsunami",
};
function getAlertType(code) {
  return ALERT_TYPE_MAP[code] || "Unknown Alert Type";
}

io.on("connection", async (socket) => {
  console.log("User connected: ", socket.id);
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const entries = await RSSFeedEntry.find({
      publishedDate: {
        $gte: oneWeekAgo,
      }
    });
    io.emit("allEntries", entries);
    console.log("allEntries emitted", entries.length);
  } catch (err) {
    console.log("Error emitting allEntries: ", err);
  }
});


