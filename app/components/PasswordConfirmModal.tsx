import {
  Button,
  Group,
  Modal,
  PasswordInput,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useSession } from "next-auth/react";
import React, { useState } from "react";

type PasswordModalProps = {
  open: boolean;
  onClose: () => void;
  onPasswordValid: () => void;
};

export default function PasswordModal(props: PasswordModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      password: "",
    },
    validate: {
      password: (value) =>
        value.length < 20000 ? null : "Must be less than 20000 characters",
    },
  });
  async function handleSubmit(values: { password: string }) {
    setLoading(true);
    try {
      const response = await fetch("/api/checkPassword", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: values.password,
        }),
      });
      const responseData = await response.json();
      if (response.ok) {
        props.onPasswordValid();
        setErrorMessage(null);
        props.onClose();
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
    <Modal
      opened={props.open}
      onClose={props.onClose}
      title={<Text>Enter password to continue</Text>}
    >
      <form
        onSubmit={form.onSubmit(async (values) => await handleSubmit(values))}
      >
        <PasswordInput label="Password" {...form.getInputProps("password")} />
        {errorMessage && <Text style={{ color: "red" }}>{errorMessage}</Text>}
        <Group position="center" pt="md">
          <Button variant="default" loading={loading} type="submit">
            Submit
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
