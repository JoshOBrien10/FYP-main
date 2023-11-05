import {
  Button,
  Card,
  Group,
  Modal,
  TextInput,
  Text,
  ActionIcon,
  createStyles,
  rem,
  Divider,
  Slider,
  Checkbox,
  Switch,
  Container,
  PasswordInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import React from "react";

import { LocationInput } from "./LocationInput";
import { Notifications } from "@mantine/notifications";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Providers } from "./Providers";

type SignUpModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function SignUpModal(props: SignUpModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
  } | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [phone, setPhone] = useState("");

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      alertsEnabled: false,
      alertDistance: 0,
    },
    validate: {
      email: (value) => (!value ? "Email is required" : null),
      password: (value) => (!value ? "Password is required" : null),
      alertsEnabled: (value) =>
        value && !selectedLocation
          ? "Please set a location before enabling alerts."
          : null,
    },
  });
  async function handleSubmit(values: {
    email: string;
    password: string;
    alertsEnabled: boolean;
    alertDistance: number;
  }) {
    setLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          alertSMS: phone,
          location: selectedLocation?.address,
          lat: selectedLocation?.lat,
          lng: selectedLocation?.lng,
        }),
      });
      const responseData = await response.json();
      if (response.ok && responseData.user) {
        signIn("credentials", {
          email: values.email,
          password: values.password,
        });
        props.onClose();
        Notifications.show({
          title: "Signed Up",
          message: "You have successfully signed up!",
          color: "green",
        });
      } else if (response && responseData.error) {
        setErrorMessage(responseData.error);
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
        title={<Text style={{ textAlign: "center" }}>Sign Up</Text>}
      >
        <Providers />
        <Divider my="xs" label="Or with" labelPosition="center" />
        <form
          onSubmit={form.onSubmit(async (values) => await handleSubmit(values))}
        >
          <TextInput
            mt={8}
            placeholder="email"
            type="email"
            label="Email"
            withAsterisk
            {...form.getInputProps("email")}
          />
          <PasswordInput
            mt={8}
            placeholder="password"
            label="password"
            withAsterisk
            {...form.getInputProps("password")}
          />
          <LocationInput
            mt={8}
            label="Location"
            description="Set your area to opt-in for nearby disaster alerts."
            placeholder="Enter your location"
            onPlaceChange={(place: any) => {
              setSelectedLocation(place);
            }}
          />
          <Switch
            color="gray"
            mt={8}
            labelPosition="left"
            label=" Get alerts of nearby natural disasters"
            {...form.getInputProps("alertsEnabled")}
          />
          {form.values.alertsEnabled && (
            <>
              <Text size="sm" mt={8}>
                Alert Distance: <b>{form.values.alertDistance || "0"} km</b>
              </Text>
              <Slider
                color="gray"
                label={null}
                {...form.getInputProps("alertDistance")}
                min={1}
                max={200}
              />
              <TextInput
                my={8}
                description="Leave blank to use account email"
                placeholder="Email for Alerts"
                label="Alert Email"
                {...form.getInputProps("alertEmail")}
              />
              <Text size="sm" style={{ display: "block", fontWeight: "500" }}>
                Sms Alert
              </Text>
              <PhoneInput
                country="au"
                value={phone}
                countryCodeEditable={false}
                onChange={(value: string) => setPhone(value)}
                enableSearch
                inputStyle={{ width: "100%", color: "black" }}
              />
            </>
          )}
          <Divider mt={20} />

          <Group position="center" mt={8}>
            <Text>
              {errorMessage && (
                <div style={{ color: "red", display: "block" }}>
                  {errorMessage}
                </div>
              )}
            </Text>
            <Button variant="default" loading={loading} type="submit">
              Sign Up
            </Button>
          </Group>
        </form>
      </Modal>
    </Group>
  );
}
