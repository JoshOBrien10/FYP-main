import {
  Button,
  Card,
  Group,
  Loader,
  Menu,
  Modal,
  ScrollArea,
  Table,
  Text,
  createStyles,
  rem,
} from "@mantine/core";
import {
  IconPencil,
  IconDots,
  IconTrash,
  IconHammer,
  IconUserCheck,
  IconBuilding,
} from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { User } from "next-auth";

const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [trigger, setTrigger] = useState<number>(Date.now());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/getUsers")
      .then((res) => res.json())
      .then((data) => {
        const convertedData = data.map((user: { _id: any }) => ({
          ...user,
          id: user._id,
        }));
        setUsers(convertedData);
      });
    setLoading(false);
  }, [trigger]);

  return { users, refetch: () => setTrigger(Date.now()), loading };
};


export function UserAdminTable() {
  const { users, refetch, loading } = useUsers();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    title: string;
    onConfirm: () => void;
  }>();

  const closeModal = () => setModalOpen(false);

  const roles = [
    {
      label: "Change to Org",
      value: "org",
      color: "blue",
      icon: <IconBuilding size={14} />,
    },
    {
      label: "Change to Admin",
      value: "admin",
      color: "green",
      icon: <IconUserCheck size={14} />,
    },
    {
      label: "Change to User",
      value: "user",
      color: "green",
      icon: <IconUserCheck size={14} />,
    },
  ];

  const changeRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch("/api/changeRole", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change role");
      }
      refetch();
    } catch (error) {
      throw new Error("Failed to change role");
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch("/api/deleteUser", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      refetch();
    } catch (error) {
    }
  };

  const rows = users.map((user, index) => {
    const availableRoles = roles.filter((role) => role.value !== user.role);
    return (
      <tr key={index}>
        <td>{user.name || <i>not set</i>}</td>
        <td>{user.email}</td>
        <td>{user.location || <i>not set</i>}</td>
        <td>{user.role}</td>
        <td>
          <Menu shadow="md" withArrow trigger="hover" withinPortal>
            <Menu.Target>
              <IconDots className="cursor-pointer" />
            </Menu.Target>

            <Menu.Dropdown>
              {availableRoles.map((role) => (
                <Menu.Item
                  key={role.value}
                  color={role.color}
                  icon={role.icon}
                  onClick={() => {
                    setModalData({
                      title: "Are you sure you want to change this users role?",
                      onConfirm: () => changeRole(user.id, role.value),
                    });
                    setModalOpen(true);
                  }}
                >
                  {role.label}
                </Menu.Item>
              ))}
              <Menu.Item
                color="red"
                icon={<IconTrash size={14} />}
                onClick={() => {
                  setModalData({
                    title: "Are you sure you want to delete this user?",
                    onConfirm: () => deleteUser(user.id),
                  });
                  setModalOpen(true);
                }}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </td>
      </tr>
    );
  });

  return (
    <>
      <Modal opened={modalOpen} onClose={closeModal} title={modalData?.title}>
        <Group position="center" spacing="10rem">
          <Button variant="default" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            variant="default"
            color="red"
            onClick={() => {
              modalData?.onConfirm();
              closeModal();
            }}
          >
            Confirm
          </Button>
        </Group>
      </Modal>

      <ScrollArea className="container mx-auto my-6 flex-1 overflow-auto rounded-md border">
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Location</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{loading ? null : rows}</tbody>
        </Table>
        {loading && (
          <Group position="center" mt="md">
            <Loader color="gray" size="md" />
          </Group>
        )}
      </ScrollArea>
    </>
  );
}
