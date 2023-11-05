import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  InfoWindow,
  Marker,
  MarkerClusterer,
} from "@react-google-maps/api";
import { io } from "socket.io-client";
import Link from "next/link";
import { disasterIcons, mapStyles } from "types/types";
import { Container, Text } from "@mantine/core";

const containerStyle = {
  width: "100%",
  height: "70vh",
};

const center = {
  lat: 10,
  lng: 10,
};

interface Entry {
  _id: string;
  title: string;
  description: string;
  lat: string;
  lng: string;
  publishedDate: string;
  alertType: string;
  alertLevel: string;
  country: string;
}

function MapComponent() {
  const [markers, setMarkers] = useState<Entry[]>([]);
  const [activeInfo, setActiveInfo] = useState<Entry | null>(null);
  useEffect(() => {
    const PORT = process.env.NEXT_PUBLIC_HEROKU_URL || "http://localhost:3010";
    const socket = io(PORT, {
      transports: ["websocket", "polling"],
    });
    console.log("Setting up listeners");
    socket.on("allEntries", (data: Entry[]) => {
      console.log("Received allEntries", data);
      setMarkers(data);
    });
    socket.on("newEntry", (data: Entry) => {
      setMarkers((oldMarkers) => [...oldMarkers, data]);
    });

    socket.on("deleteEntry", (deletedEntryId: string) => {
      setMarkers((oldMarkers) =>
        oldMarkers.filter((entry) => entry._id !== deletedEntryId)
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  console.log(markers);
  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={3}
      options={{
        styles: mapStyles,
        streetViewControl: false,
        scaleControl: false,
        mapTypeControl: false,
        panControl: false,
        zoomControl: true,
        rotateControl: false,
        fullscreenControl: true,
      }}
    >
      <MarkerClusterer
        options={{
          imagePath:
            "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
        }}
      >
        {(clusterer) => (
          <>
            {markers.map((marker) => (
              <Marker
                key={marker._id}
                position={{
                  lat: parseFloat(marker.lat),
                  lng: parseFloat(marker.lng),
                }}
                icon={{
                  url: disasterIcons[marker.alertType] || disasterIcons.default,
                  scaledSize: new window.google.maps.Size(32, 32),
                }}
                clusterer={clusterer}
                onClick={() => setActiveInfo(marker)}
              />
            ))}
          </>
        )}
      </MarkerClusterer>

      {activeInfo && (
        <InfoWindow
          position={{
            lat: parseFloat(activeInfo.lat),
            lng: parseFloat(activeInfo.lng),
          }}
          onCloseClick={() => setActiveInfo(null)}
          options={{
            pixelOffset: new window.google.maps.Size(0, -32),
          }}
        >
          <Container>
            <Text size="xl" c="black" fw="700">
              {activeInfo.title}
            </Text>
            <Text>{activeInfo.description}</Text>
            <Link href={`/alerts/${activeInfo._id}`} className="no-underline">
              Read More
            </Link>
          </Container>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

export default MapComponent;
