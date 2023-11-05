import {
  createStyles,
  Header,
  Container,
  Group,
  Button,
  Burger,
  rem,
  Text,
  Drawer,
  Flex,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import Link from "next/link";
import { headerLinks } from "../lib/headerLinks";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import SignInModal from "./SignInModal";
import SignUpModal from "./SignUpModal";

const useStyles = createStyles((theme) => ({
  links: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  burger: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },

  link: {
    color: "white",
    display: "block",
    lineHeight: 1,
    padding: `${rem(8)} ${rem(12)}`,
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    fontSize: theme.fontSizes.md,

    "&:hover": {
      color: "lightgrey",
    },
  },

  linkLabel: {
    marginRight: rem(5),
  },
}));

export function HeaderAction() {
  const { classes } = useStyles();
  const [opened, { open, close }] = useDisclosure(false);

  const { data: session } = useSession();
  const [isLogModalOpen, setLogModalOpen] = useState(false);
  const [isSignModalOpen, setSignModalOpen] = useState(false);
  const items = headerLinks.links.map((link) => {
    if (link.adminRequired && session?.user?.role !== "admin") {
      return null;
    }
    if (link.authRequired && !session) {
      return null;
    }
    return (
      <Link
        key={link.label}
        href={link.link}
        className={classes.link}
        onClick={close}
      >
        <Text> {link.label}</Text>
      </Link>
    );
  });
  return (
    <>
      <SignInModal
        open={isLogModalOpen}
        onClose={() => setLogModalOpen(false)}
      />
      <SignUpModal
        open={isSignModalOpen}
        onClose={() => setSignModalOpen(false)}
      />
      <Header height={rem(60)} sx={{ borderBottom: "1px solid white" }} mb={0}>
        <Flex
          p="sm"
          justify="space-between"
          align="center"
          direction="row"
          wrap="nowrap"
        >
          <Flex align="center">
            <Burger
              opened={opened}
              onClick={!opened ? open : close}
              className={classes.burger}
              size="sm"
            />
            <Text>DisasterWatch</Text>
          </Flex>

          <Group
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
            }}
            className={classes.links}
          >
            {items}
          </Group>
          <Drawer
            opened={opened}
            size="10rem"
            onClose={close}
            title="DisasterWatch"
          >
            {items}
          </Drawer>
          <Flex gap="md" align="center">
            {session?.user ? (
              <>
                <Text>{session.user.email || session.user.name}</Text>
                <Button variant="default" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="default"
                  onClick={() => setLogModalOpen(true)}
                >
                  Sign In
                </Button>
                <Button
                  variant="default"

                  onClick={() => setSignModalOpen(true)}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Flex>
        </Flex>
      </Header>
    </>
  );
}
