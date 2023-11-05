import { MongoClient, ObjectId } from "mongodb";
import {
  Card,
  Container,
  Group,
  Text,
  Stack,
  ScrollArea,
  Loader,
  Divider,
  ActionIcon,
  Tooltip,
  SimpleGrid,
  Grid,
  Title,
  Col,
} from "@mantine/core";
import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import Head from "next/head";
import clientPromise from "../../lib/mongodb";
import { CreatePost } from "components/CreatePost";
import { GoogleMap, InfoWindow, Marker } from "@react-google-maps/api";
import { disasterIcons, disasterType, mapStyles } from "types/types";
import { useEffect, useState } from "react";
import PostCard from "components/PostCard";
import { useSession } from "next-auth/react";
import { IconInfoCircle } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";

const AlertPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  event,
}) => {
  const [refresh, setRefresh] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeInfo, setActiveInfo] = useState(false);
  const { data: session } = useSession();
  const isMobile = useMediaQuery("(max-width: 60rem)");

  const renderRow = (label: string, value: string) => (
    <>
      <Col span={3}>
        <Text>{label}:</Text>
      </Col>
      <Col span={9}>
        <Text style={{ fontWeight: "bold" }}>{value}</Text>
      </Col>
    </>
  );
  async function fetchPosts() {
    try {
      const res = await fetch(`/api/getPosts?alertId=${event._id}`);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error);
      }
      setPosts(data.data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchPosts();
  }, [refresh]);

  const handlePosts = () => {
    setRefresh(!refresh);
  };
  const center = {
    lat: event.lat,
    lng: event.lng,
  };
  const containerStyle = {
    width: "100%",
    height: "70vh",
  };
  console.log(event);
  return (
    <>
      <Head>
        <title>{event.title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container
        size="100rem"
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h1>{event.title}</h1>
        <Group spacing="xs" align="top" mb="1rem" grow={!isMobile}>
          <Card
            withBorder
            radius="md"
            style={{ width: isMobile ? "100%" : undefined }}
          >
            <Text mb={8}>{event.description}</Text>
            <Grid>
              {renderRow(
                "Alert Type",
                disasterType[event.alertType] || "Not recorded"
              )}
              {renderRow("Alert Level", event.alertLevel || "Not recorded")}
              {renderRow("Alert Score", event.alertScore || "Not recorded")}
              {renderRow(
                "Alert Date",
                event.publishedDate
                  ? new Date(event.publishedDate).toLocaleDateString()
                  : "Not recorded"
              )}
              {renderRow(
                "Exposed Population",
                event.population || "Not recorded"
              )}
              {renderRow("Location", event.country || "Not recorded")}
            </Grid>
          </Card>
          <Card
            radius="md"
            withBorder
            p="sm"
            pb={0}
            style={{
              backgroundColor: "transparent",
              width: isMobile ? "100%" : undefined,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Text align="center">Organisation updates</Text>
            <Divider mb={8} />
            <ScrollArea.Autosize
              className={"bg-gray-100"}
              mah={"15rem"}
              style={{ flexGrow: 1 }}
            >
              <Stack
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1,
                }}
              >
                {loading ? (
                  <Loader color="gray" />
                ) : posts.length > 0 ? (
                  posts.map((post, index) => (
                    <PostCard
                      key={index}
                      post={post}
                      onPostDeleted={handlePosts}
                    />
                  ))
                ) : (
                  <Card
                    withBorder
                    shadow="sm"
                    radius="md"
                    mb="md"
                    style={{ flexGrow: 1 }}
                  >
                    <Group position="center">
                      <Text weight={500}>No updates have been posted.</Text>
                    </Group>
                  </Card>
                )}
              </Stack>
            </ScrollArea.Autosize>
            <Divider />
            {!session?.user?.role ||
            (session.user.role !== "admin" && session.user.role !== "org") ? (
              <Group position="center" mt="md">
                <Text>
                  In order to post alert updates you must be a verified
                  organisation.
                </Text>
                <Tooltip label="You can request verification in your preferences page">
                  <ActionIcon>
                    <IconInfoCircle />
                  </ActionIcon>
                </Tooltip>
              </Group>
            ) : (
              <CreatePost alertId={event._id} onPostCreated={handlePosts} />
            )}
          </Card>
        </Group>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={8}
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
          <Marker
            key={event._id}
            position={{
              lat: parseFloat(event.lat),
              lng: parseFloat(event.lng),
            }}
            icon={{
              url: disasterIcons[event.alertType] || disasterIcons.default,
              scaledSize: new window.google.maps.Size(32, 32),
            }}
            onClick={() => setActiveInfo(true)}
          />
          {activeInfo && (
            <InfoWindow
              position={{
                lat: parseFloat(event.lat),
                lng: parseFloat(event.lng),
              }}
              onCloseClick={() => setActiveInfo(false)}
              options={{
                pixelOffset: new window.google.maps.Size(0, -32),
              }}
            >
              <div>
                <h2>{event.title}</h2>
                <Text>{event.description}</Text>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </Container>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export async function getStaticProps(
  context: GetStaticPropsContext<{ id: string }>
) {
  const id = context.params?.id;
  console.log(id);
  if (id == null) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  const client = await clientPromise;
  const db = client.db();

  const event = await db
    .collection("rssfeedentries")
    .findOne({ _id: new ObjectId(id) });
  console.log(event);
  if (!event) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      event: JSON.parse(JSON.stringify(event)),
    },
  };
}
export default AlertPage;
