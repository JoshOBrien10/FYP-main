import {
  Button,
  Card,
  Group,
  Menu,
  Modal,
  ScrollArea,
  Table,
  Text,
} from "@mantine/core";
import {
  IconPencil,
  IconDots,
  IconTrash,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
interface VerificationRequest {
  _id: string;
  email: string;
  name: string;
  userId: string;
  evidence: string;
  timestamp: string;
  status: string;
}
const useVerificationRequests = () => {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [trigger, setTrigger] = useState<number>(Date.now());

  useEffect(() => {
    fetch("/api/getRequests")
      .then((res) => res.json())
      .then((data) => {
        setRequests(data);
      });
  }, [trigger]);

  return { requests, refetch: () => setTrigger(Date.now()) };
};

export function VerificationAdminTable() {
  const { requests, refetch } = useVerificationRequests();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    title: string;
    onConfirm: () => void;
  }>();

  const closeModal = () => setModalOpen(false);

  const handleRequest = async (
    requestId: string,
    userId: string,
    isApproved: boolean
  ) => {
    try {
      const response = await fetch(`/api/handleRequest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId, userId, isApproved }),
      });
      if (response.ok) {
        refetch();
      } else {
        console.error("Failed to process the request");
      }
    } catch (error) {
      console.error("Error during processing:", error);
    }
  };

  const rows = requests.map((request, index) => (
    <tr key={index}>
      <td>{request.email || "Not Set"}</td>
      <td>{new Date(request.timestamp).toLocaleDateString()}</td>
      <td>{request.status}</td>
      <td>{request.evidence}</td>
      <td>
        <Menu shadow="md" withArrow trigger="hover" withinPortal>
          <Menu.Target>
            <IconDots className="cursor-pointer" />
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              color="green"
              icon={<IconCheck size={14} />}
              onClick={() => {
                setModalData({
                  title: "Approve this verification request?",
                  onConfirm: () =>
                    handleRequest(request._id, request.userId, true),
                });
                setModalOpen(true);
              }}
            >
              Approve
            </Menu.Item>
            <Menu.Item
              color="red"
              icon={<IconX size={14} />}
              onClick={() => {
                setModalData({
                  title: "Reject this verification request?",
                  onConfirm: () =>
                    handleRequest(request._id, request.userId, false),
                });
                setModalOpen(true);
              }}
            >
              Reject
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </td>
    </tr>
  ));

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
              <th>Email</th>
              <th>Submission Date</th>
              <th>Status</th>
              <th>Evidence</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </ScrollArea>
    </>
  );
}
