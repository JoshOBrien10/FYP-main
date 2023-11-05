import {
  Button,
  Container,
  Group,
  PasswordInput,
  createStyles,
  Text,
  rem,
} from "@mantine/core";
import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import clientPromise from "../../lib/mongodb";
import { useState } from "react";
import { useForm } from "@mantine/form";
import { Notifications } from "@mantine/notifications";
import Head from "next/head";

const useStyles = createStyles((theme) => ({
  mainform: {
    ...theme.fn.focusStyles(),
    border: `${rem(1)} solid `,
    fontSize: theme.fontSizes.sm,
    alignItems: "center",
    flexGrow: 1,
  },
  form: {
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
  },
  simpleGrid: { width: "100%", margin: "0 auto" },
  header: {
    fontSize: "2rem",
    fontWeight: "bold",
  },
}));

const ResetPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  token,
}) => {
  const { classes } = useStyles();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validate: {
      password: (value) =>
        value.length < 20000 ? null : "Must be less than 20000 characters",
      confirmPassword: (value) =>
        value.length < 20000 ? null : "Must be less than 20000 characters",
    },
  });

  async function handleSubmit(values: {
    password: string;
    confirmPassword: string;
  }) {
    if (values.password !== values.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/setPassword", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: values.password,
          token,
        }),
      });
      const responseData = await response.json();
      if (response.ok) {
        setErrorMessage(null);
        Notifications.show({
          title: "Success!",
          message:
            "Your password has been reset successfully, you will be redirected back to home.",
          color: "green",
        });
        form.reset();
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        setErrorMessage(responseData.error);
      }
    } catch (error) {
      console.error("There was an error sending the request:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Reset Password</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container
        my="1rem"
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text className={classes.header}>Reset Password</Text>
        <form
          onSubmit={form.onSubmit(async (values) => await handleSubmit(values))}
          className={classes.mainform}
        >
          <Container className={classes.form}>
            <PasswordInput
              label="New Password"
              {...form.getInputProps("password")}
            />
            <PasswordInput
              label="Confirm Password"
              {...form.getInputProps("confirmPassword")}
            />
            {errorMessage && (
              <Text style={{ color: "red" }}>{errorMessage}</Text>
            )}
            <Group position="center" pt="md">
              <Button variant="default" loading={loading} type="submit">
                Submit
              </Button>
            </Group>
          </Container>
        </form>
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
  context: GetStaticPropsContext<{ token: string }>
) {
  const token = context.params?.token;

  if (token == null) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME);
  const tokenExists = await db
    .collection("users")
    .findOne({ resetPasswordToken: token });

  if (!tokenExists) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  return {
    props: {
      token,
    },
  };
}
export default ResetPage;
