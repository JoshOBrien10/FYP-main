import { Card, Text, Group, Menu, rem, ActionIcon, Flex } from "@mantine/core";
import { modals } from "@mantine/modals";
import React, { useState } from "react";
import { IconDots, IconEye, IconShare, IconTrash } from "@tabler/icons-react";
import { useSession } from "next-auth/react";

type Post = {
  _id: string;
  text: string;
  user: string;
  date: Date;
};

export type PostCardProps = {
  post: Post;
  onPostDeleted: () => void;
};

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
});

export default function PostCard({ post, onPostDeleted }: PostCardProps) {
  const { data: session } = useSession();
  const deletePost = async (postId: string) => {
    try {
      console.log(postId);
      const response = await fetch("/api/deletePost", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }
      onPostDeleted();
    } catch (error) {}
  };
  return (
    <Card withBorder shadow="sm" radius="md">
      <Card.Section inheritPadding>
        <Flex direction="row" justify="space-between" align="center">
          <Text weight={500} size="lg">
            {post.user || "Unknown Organisation"}
          </Text>
          <Flex direction="row" align="center" gap="md">
            <Text size="sm">{dateTimeFormatter.format(post.date)}</Text>
            {session?.user.role === "admin" && (
              <Menu
                withinPortal
                position="left-start"
                shadow="sm"
                trigger="hover"
              >
                <Menu.Target>
                  <ActionIcon>
                    <IconDots size="1rem" />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item
                    icon={<IconTrash size={rem(14)} />}
                    color="red"
                    onClick={() => {
                      deletePost(post._id);
                    }}
                  >
                    Delete Post
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Flex>
        </Flex>
      </Card.Section>
      <Card.Section inheritPadding className="mt-2">
        <Text size="lg">{post.text}</Text>
      </Card.Section>
    </Card>
  );
}
