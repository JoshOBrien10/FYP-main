import {
  Button,
  Group,
  Modal,
  TextInput,
  Text,
  Divider,
  ActionIcon,
  PasswordInput,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Providers } from "./Providers";
import { IconArrowLeft } from "@tabler/icons-react";

type SignInModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function SignInModal(props: SignInModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);

  type FormShape = {
    email: string;
    password: string;
  };

  const form = useForm({
    initialValues: { email: "", password: "" },
    validate: {
      email: (value) => (!value ? "Email is required" : null),
      password: (value) => (!value ? "Password is required" : null),
    },
  });

  const resetForm = useForm({
    initialValues: { email: "" },
    validate: {
      email: (value) => (!value ? "Email is required" : null),
    },
  });

  function switchView() {
    setShowRecovery(!showRecovery);
    setErrorMessage(null);
  }
  async function handleSubmit(values: FormShape) {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      if (result && result.error) {
        setErrorMessage(result.error);
      } else {
        setErrorMessage(null);
        props.onClose();
        Notifications.show({
          title: "Logged In",
          message: "You have successfully logged in!",
          color: "green",
        });
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetSubmit(values: { email: string }) {
    setLoading(true);
    try {
      const response = await fetch("/api/resetPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
        }),
      });
      const responseData = await response.json();
      if (response.ok) {
        setErrorMessage(null);
        props.onClose();
        Notifications.show({
          title: "Password request submitted",
          message: "You have submitted a password request",
          color: "green",
        });
      } else {
        setErrorMessage(responseData.error);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <Group grow>
      <Modal
        opened={props.open}
        onClose={props.onClose}
        title={
          <Group>
            {showRecovery && (
              <ActionIcon onClick={() => switchView()}>
                <IconArrowLeft />
              </ActionIcon>
            )}
            <Text style={{ textAlign: "center" }}>
              {showRecovery ? "Reset Password" : "Login"}
            </Text>
          </Group>
        }
      >
        {showRecovery ? (
          <>
            <form
              onSubmit={resetForm.onSubmit(
                async (values) => await handleResetSubmit(values)
              )}
            >
              <TextInput
                label="Account Email"
                type="email"
                placeholder="email"
                {...resetForm.getInputProps("email")}
              />
              <Text>
                {errorMessage && (
                  <div style={{ color: "red" }}>{errorMessage}</div>
                )}
              </Text>
              <Group position="center" pt="md">
                <Button variant="default" loading={loading} type="submit">
                  <Text>Submit Password Reset</Text>
                </Button>
              </Group>
            </form>
          </>
        ) : (
          <>
            <Providers />
            <Divider my="xs" label="Or with" labelPosition="center" />
            <form
              onSubmit={form.onSubmit(
                async (values) => await handleSubmit(values)
              )}
            >
              <TextInput
                mt={8}
                label="Email"
                type="email"
                placeholder="email"
                {...form.getInputProps("email")}
              />
              <PasswordInput
                mt={8}
                label="Password"
                placeholder="password"
                {...form.getInputProps("password")}
              />
              <Text>
                {errorMessage && (
                  <div style={{ color: "red" }}>{errorMessage}</div>
                )}
              </Text>
              <Group position="center" pt="md">
                <Button variant="default" loading={loading} type="submit">
                  Log in
                </Button>
              </Group>
            </form>
            <Divider mt="md" />
            <Group position="center" pt="md">
              <Button variant="subtle" color="gray" onClick={() => switchView()}>
                <Text>Forget Password?</Text>
              </Button>
            </Group>
          </>
        )}
      </Modal>
    </Group>
  );
}
