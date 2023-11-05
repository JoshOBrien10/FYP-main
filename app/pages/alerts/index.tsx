import React, { useState, useEffect } from "react";
import {
  Pagination,
  TextInput,
  LoadingOverlay,
  Title,
  Container,
  Stack,
  Group,
  Table,
  Loader,
  Center,
  Flex,
  Text,
  ScrollArea,
} from "@mantine/core";
import FiltersBar from "components/FilterBar";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";

interface Alert {
  _id: string;
  title: string;
  description: string;
  link: string;
  lat: string;
  lng: string;
  publishedDate: string;
  author?: string;
  eventType: string;
  alertLevel: string;
  country: string;
}

const useFetchAlerts = (
  url: string,
  dependencies: any[]
): {
  alerts: Alert[];
  totalPages: number;
  loading: boolean;
  error: any; 
} => {
  const [alerts, setAlerts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(url);
        const data = await res.json();
        console.log(url);
        setAlerts(data.alerts);
        setTotalPages(Math.ceil(data.total / itemsPerPage));
      } catch (error) {
        console.error("Error fetching data: ", error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, dependencies);

  return { alerts, totalPages, loading, error };
};
const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "long",
});

export const useFilters = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [level, setLevel] = useState("All");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  return {
    filters: { searchTerm, level, startDate, endDate },
    setFilters: { setSearchTerm, setLevel, setStartDate, setEndDate },
  };
};

function AlertComponent() {
  const [currentPage, setCurrentPage] = useState(1);
  const { filters, setFilters } = useFilters();
  const url = `/api/getAlerts?page=${currentPage}&searchTerm=${
    filters.searchTerm
  }&level=${filters.level}&startDate=${
    filters.startDate ? filters.startDate.toISOString() : ""
  }&endDate=${filters.endDate ? filters.endDate.toISOString() : ""}`;

  const { alerts, totalPages, loading, error } = useFetchAlerts(url, [
    currentPage,
    ...Object.values(filters),
  ]);

  const router = useRouter();

  const navigateToAlert = (id: string) => {
    router.push(`/alerts/${id}`);
  };

  const rows = alerts.map((alert, index) => (
    <tr
      key={index}
      onClick={() => navigateToAlert(alert._id)}
      style={{ cursor: "pointer" }}
    >
      <td>{alert.alertLevel}</td>
      <td>{alert.country}</td>
      <td>{alert.title}</td>
      <td>{dateTimeFormatter.format(new Date(alert.publishedDate))}</td>
    </tr>
  ));

  return (
    <>
      <Head>
        <title>Alerts</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container
        size="100rem"
        mb="1rem"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FiltersBar {...filters} {...setFilters} />
        {error && (
          <Title order={4} style={{ color: "red" }}>
            {error}
          </Title>
        )}
        <Table highlightOnHover>
          <thead>
            <tr>
              <th>Level</th>
              <th>Location</th>
              <th>Description</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>{loading ? null : rows}</tbody>
        </Table>
        {loading ? (
          <Group position="center" mt="md">
            <Loader color="gray" size="md" />
          </Group>
        ) : rows.length === 0 ? (
          <Group position="center" mt="md">
            <Text>No alerts found.</Text>
          </Group>
        ) : null}
        <Pagination
          color="gray"
          total={totalPages}
          value={currentPage}
          onChange={(page) => setCurrentPage(page)}
        />
      </Container>
    </>
  );
}

export default AlertComponent;
