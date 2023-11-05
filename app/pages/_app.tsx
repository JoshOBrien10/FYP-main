import { SessionProvider } from "next-auth/react";
import "styles.css";
import type { AppProps } from "next/app";
import type { Session } from "next-auth";
import { Group, Loader, MantineProvider } from "@mantine/core";
import { HeaderAction } from "../components/header";
import { Libraries, useJsApiLoader } from "@react-google-maps/api";
import FooterAction from "../components/footer";
import { Notifications } from "@mantine/notifications";
import React from "react";

const libraries = ["places"] as Libraries;

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API,
    libraries,
  });

  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        colorScheme: "dark",
      }}
    >
      <Notifications position="top-right" autoClose={3000} />
      <SessionProvider session={session}>
        <HeaderAction />
        <div className="layout">
          <div className="content">
            {isLoaded ? (
              <Component {...pageProps} />
            ) : (
              <Group position="center" mt="md">
                <Loader color="gray" size="md" />
              </Group>
            )}
          </div>
          <FooterAction />
        </div>
      </SessionProvider>
    </MantineProvider>
  );
}