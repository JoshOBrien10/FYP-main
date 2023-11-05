import { Button, Textarea, Card, Group, Flex } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Notifications } from "@mantine/notifications";
import { useState } from "react";
export type createPostProps = {
  alertId: string;
  onPostCreated: () => void;
};
export function CreatePost({ alertId, onPostCreated }: createPostProps) {
  const form = useForm({
    initialValues: { text: "" },
    validate: {
      text: (value) =>
        value.length < 20000
          ? null
          : "Reason must be less than 20000 characters",
    },
  });
  const [loading, setLoading] = useState(false);
  async function handleSubmit(values: { text: string }) {
    setLoading(true);
    try {
      const response = await fetch("/api/createPost", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: values.text,
          alertId: alertId,
        }),
      });
      const responseData = await response.json();
      if (response.ok) {
        Notifications.show({
          title: "Alert post created",
          message: "You have successfully created an alert post!",
          color: "green",
        });
        form.reset();
        onPostCreated();
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
    <form
      onSubmit={form.onSubmit(async (values) => await handleSubmit(values))}
    >
      <Flex  gap="md" align="center" direction="row" wrap="nowrap">
        <Textarea
          placeholder="Write a post"
          {...form.getInputProps("text")}
          variant="unstyled"
          maxRows={2}
          autosize
          style={{ flexGrow: 1 }}
        />

        <Button
          variant="default"
          type="submit"
          loading={loading}
          radius="md"
          disabled={!form.values.text || form.values.text.trim() === ""}
        >
          Post
        </Button>
      </Flex>
    </form>
  );
}
