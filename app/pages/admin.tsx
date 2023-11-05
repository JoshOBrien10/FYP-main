import {
  Container,
  createStyles,
  rem,
  getStylesRef,
  Tabs,
} from "@mantine/core";
import Head from "next/head";
import { useEffect, useState } from "react";
import { UserAdminTable } from "../components/UserList";
import { VerificationAdminTable } from "components/VerificationList";
import AlertForm from "components/AlertForm";

const useStyles = createStyles((theme) => ({
  tab: {
    ...theme.fn.focusStyles(),
    border: `${rem(1)} solid`,
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    fontSize: theme.fontSizes.sm,
    alignItems: "center",
    color: "white",
    flexGrow: 1,
    "&:disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    },

    "&:not(:first-of-type)": {
      borderLeft: 0,
    },

    "&:first-of-type": {
      borderTopLeftRadius: theme.radius.md,
      borderBottomLeftRadius: theme.radius.md,
    },

    "&:last-of-type": {
      borderTopRightRadius: theme.radius.md,
      borderBottomRightRadius: theme.radius.md,
    },

    "&[data-active]": {
      backgroundColor: theme.white,
      color: theme.black,
    },
  },

  tabIcon: {
    marginRight: theme.spacing.xs,
    display: "flex",
    alignItems: "center",
  },

  tabsList: {
    display: "flex",
  },
}));

export default function Page() {
  const { classes } = useStyles();
  return (
    <>
      <Head>
        <title>Admin</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container className="justify-center pt-12" my={8}>
        <Tabs defaultValue="Users" >
          <Tabs.List className={classes.tabsList}>
            <Tabs.Tab value="Users" className={classes.tab}>
              Users
            </Tabs.Tab>
            <Tabs.Tab value="Requests" className={classes.tab}>
              Verification Requests
            </Tabs.Tab>
            <Tabs.Tab value="Alerts" className={classes.tab}>
             Create an Alert
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="Users" pt="xs">
            <UserAdminTable />
          </Tabs.Panel>

          <Tabs.Panel value="Requests" pt="xs">
            <VerificationAdminTable />
          </Tabs.Panel>
          <Tabs.Panel value="Alerts">
            <AlertForm />
          </Tabs.Panel>
        </Tabs>
      </Container>
    </>
  );
}
