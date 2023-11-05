import { Container, Text, Group, Anchor, Footer } from "@mantine/core";
import packageJSON from "../package.json";
import Link from "next/link";

export default function FooterAction() {
  return (
    <Footer
      height="2rem"
      bottom={0}
      sx={{ borderTop: "1px solid white" }}
      style={{ left: 0, bottom: 0, right: 0 }}
    >
      <Container fluid>
        <Group position="apart">
        </Group>
      </Container>
    </Footer>
  );
}
