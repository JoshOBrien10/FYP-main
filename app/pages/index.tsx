import {
  Container,
  createStyles,
  Text,
  SimpleGrid,
  Box,
} from "@mantine/core";
import MapComponent from "../components/Map";
import { useSession } from "next-auth/react";
import Head from "next/head";

const useStyles = createStyles((theme) => ({
  wrapper: {
    paddingTop: `calc(${theme.spacing.xl} * 2)`,
    paddingBottom: `calc(${theme.spacing.xl} * 2)`,
    minHeight: 650,
  },

  title: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  simpleGrid: {width: "100%", margin: "0 auto"},
  header: {
    fontSize: "2rem",
    fontWeight: "bold",

  },
  infoPoint: {
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
}));

export default function IndexPage() {
  const { classes } = useStyles();
  const { data: session } = useSession();
  return (
    <>
      <Head>
        <title>DisasterWatch</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container
        size="100rem"
        mb="1rem"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!session?.user && (
          <Box>
            <Text align="center" className={classes.header}>
              Welcome to DisasterWatch
            </Text>
            <SimpleGrid
              cols={2}
              verticalSpacing={1}
              className={classes.simpleGrid}
            >
              <Text className={classes.infoPoint}>
                Visualize live updates on potential threats with real-time
                disaster mapping.
              </Text>
              <Text className={classes.infoPoint}>
                Receive immediate alerts for disasters in your vicinity when you
                sign up.
              </Text>
              <Text className={classes.infoPoint}>
                Data from the Global Disaster Alert and Coordination System
                (GDACS) for accuracy.
              </Text>
              <Text className={classes.infoPoint}>
                Receive updates from relief organisations about disasters
              </Text>
            </SimpleGrid>
          </Box>
        )}
        {session?.user && (
          <Box>
            <Text align="center" className={classes.header}>
              Visualise Map
            </Text>
          </Box>
        )}
        <MapComponent />
      </Container>
    </>
  );
}