import React from "react";
import { TextInput, Select, Col, Group, Flex,} from "@mantine/core";
import { DatePicker, DatePickerInput } from "@mantine/dates";

interface FiltersBarProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  level: string;
  setLevel: React.Dispatch<React.SetStateAction<string>>;
  startDate: Date | null;
  setStartDate: React.Dispatch<React.SetStateAction<Date | null>>;
  endDate: Date | null;
  setEndDate: React.Dispatch<React.SetStateAction<Date | null>>;
}

function FiltersBar({
  searchTerm,
  setSearchTerm,
  level,
  setLevel,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: FiltersBarProps) {
  return (
    <Flex
      justify="flex-end"
      gap="md"
      align="center"
      direction="row"
      wrap="nowrap"
      mt="md"
    >
      <TextInput
        placeholder="Search alerts..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.currentTarget.value)}
      />

      <Select
        placeholder="Alert level"
        value={level}
        onChange={(value) => setLevel(value as string)}
        data={[
          { value: "All", label: "All" },
          { value: "Green", label: "Green" },
          { value: "Orange", label: "Orange" },
          { value: "Red", label: "Red" },
        ]}
      />

      <DatePickerInput
        placeholder="Start date"
        value={startDate}
        clearable
        onChange={(date) => setStartDate(date)}
      />

      <DatePickerInput
        placeholder="End date"
        value={endDate}
        clearable
        onChange={(date) => setEndDate(date)}
      />
    </Flex>
  );
}

export default FiltersBar;
