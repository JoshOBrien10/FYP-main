import { Button, Group, Modal, Text, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Notifications } from "@mantine/notifications";
import React, { useState } from "react";

type VerificationModalProps = {
  open: boolean;
  onClose: () => void;
  onUpdateVerificationStatus: (status: "none" | "pending") => void;
};

export default function VerificationModal(props: VerificationModalProps) {
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      evidence: "",
    },
    validate: {
      evidence: (value) =>
        value.length < 20000 ? null : "Must be less than 20000 characters",
    },
  });
  async function handleSubmit(values: { evidence: string }) {
    setLoading(true);
    try {
      const response = await fetch("/api/requestVerification", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          evidence: values.evidence,
        }),
      });
      const responseData = await response.json();
      if (response.ok) {
        console.log("User verified request:", responseData.message);
        props.onUpdateVerificationStatus &&
          props.onUpdateVerificationStatus("pending");
        props.onClose();
        Notifications.show({
          title: "Verifcation request created",
          message: "You have successfully created a verification request!",
          color: "green",
        });
      } else {
        console.error("Error verifying:", responseData.error);
      }
    } catch (error) {
      console.error("There was an error sending the request:", error);
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
          <Text style={{ textAlign: "center" }}>Request Verification</Text>
        }
      >
        <form
          onSubmit={form.onSubmit(async (values) => await handleSubmit(values))}
        >
          <Textarea
            mt={8}
            label="Evidence"
            {...form.getInputProps("evidence")}
          />
          <Group position="center" pt="md">
            <Button variant="default" loading={loading} type="submit">
              Submit
            </Button>
          </Group>
        </form>
      </Modal>
    </Group>
  );
}
