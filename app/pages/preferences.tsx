import { useSession } from "next-auth/react";
import type { GetServerSidePropsContext } from "next";
import {
  Button,
  Group,
  TextInput,
  Text,
  createStyles,
  rem,
  Divider,
  Slider,
  Checkbox,
  Container,
  Loader,
  Switch,
  PasswordInput,
  Overlay,
  Flex,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { SetStateAction, useEffect, useMemo, useState } from "react";
import { LocationInput } from "../components/LocationInput";
import VerificationModal from "components/VerificationModal";
import { auth } from "auth";
import clientPromise from "lib/mongodb";
import { ObjectId } from "mongodb";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import PasswordModal from "components/PasswordConfirmModal";
import { Notifications } from "@mantine/notifications";
import Head from "next/head";

const useStyles = createStyles((theme) => ({
  wrapper: {
    paddingTop: `calc(${theme.spacing.xl} * 2)`,
    paddingBottom: `calc(${theme.spacing.xl} * 2)`,
    minHeight: 650,
  },

  title: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  item: {
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.lg,
    border: `${rem(1)} solid `,
  },
  mainform: {
    ...theme.fn.focusStyles(),
    border: `${rem(1)} solid `,
    fontSize: theme.fontSizes.sm,
    alignItems: "center",
    flexGrow: 1,
    position: "relative",
    radius: "lg",
  },
  form: {
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
  },
  simpleGrid: { width: "100%", margin: "0 auto" },
  header: {
    fontSize: "2rem",
    fontWeight: "bold",
  },
}));

type PreferencesProps = {
  user: {
    name?: string;
    email?: string;
    alertsEnabled: boolean;
    alertDistance?: number;
    alertEmail?: string;
    alertSMS?: string;
    location?: string;
    verifyStatus?: "none" | "pending" | "approved" | "declined";
    provider?: string;
  };
};
export default function Preferences({ user: initialUser }: PreferencesProps) {
  const [user, setUser] = useState(initialUser);
  const [isEditMode, setIsEditMode] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      name: user.name || "",
      email: user.email || "",
      password: "",
      alertsEnabled: user.alertsEnabled,
      showAlerts: user.alertDistance != null ? true : false,
      alertDistance: user.alertDistance || 10,
      alertEmail: user.alertEmail || "",
    },
    validate: {
      email: (value) =>
        value.length < 20000
          ? null
          : "Reason must be less than 20000 characters",
      password: (value) =>
        value.length < 20000
          ? null
          : "Reason must be less than 20000 characters",
    },
  });
  const updateUser = (values: {
    name: string;
    email: string;
    password: string;
    alertsEnabled: boolean;
    alertDistance: number;
  }) => {
    setUser((prevUser) => ({ ...prevUser, ...values }));
  };
  const updateUserVerificationStatus = (status: "none" | "pending") => {
    setUser((prevUser) => ({ ...prevUser, verifyStatus: status }));
  };
  const handleCancel = () => {
    setIsEditMode(false);
    setChangePassword(false);
    form.reset();
  };

  const handlePreferences = () => {
    if (user.provider === "credentials") {
      setPasswordModalOpen(true);
    } else {
      setIsEditMode(true);
    }
  };
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
  } | null>(null);

  const [phone, setPhone] = useState(user.alertSMS);

  async function handleSubmit(values: {
    name: string;
    email: string;
    password: string;
    alertsEnabled: boolean;
    alertDistance: number;
  }) {
    try {
      setLoading(true);
      console.log("Sending update request with values:", values);
      const response = await fetch("/api/updatePreferences", {
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
      await response.json();
      Notifications.show({
        title: "Updated preferences",
        message: "You have successfully updated your preferences!",
        color: "green",
      });
      updateUser(values);
      setIsEditMode(false);
      setChangePassword(false);
    } catch (error) {
      console.error("There was an error sending the request:", error);
    } finally {
      setLoading(false);
    }
  }

  const { classes } = useStyles();

  return (
    <>
      <VerificationModal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        onUpdateVerificationStatus={updateUserVerificationStatus}
      />
      <PasswordModal
        open={isPasswordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onPasswordValid={() => setIsEditMode(true)}
      />
      <Head>
        <title>Preferences</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container
        my="1rem"
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <form
          onSubmit={form.onSubmit(async (values) => await handleSubmit(values))}
          className={classes.mainform}
        >
          <Container className={classes.form}>
            <Container className={classes.simpleGrid}>
              <Text className={classes.header}>Details</Text>
              <Divider />
              <TextInput
                disabled={!isEditMode}
                mt={8}
                placeholder="name"
                label="Name"
                {...form.getInputProps("name")}
              />
              {user.provider === "credentials" ? (
                <>
                  <TextInput
                    disabled={!isEditMode}
                    mt={8}
                    placeholder="email"
                    label="Email"
                    {...form.getInputProps("email")}
                  />
                  {!changePassword ? (
                    <Button
                      variant="default"
                      mt={8}
                      disabled={!isEditMode}
                      onClick={() => setChangePassword(true)}
                    >
                      Change Password
                    </Button>
                  ) : (
                    <PasswordInput
                      disabled={!isEditMode}
                      mt={8}
                      label="New Password"
                      placeholder="password"
                      {...form.getInputProps("password")}
                    />
                  )}
                </>
              ) : (
                <Text>Account created using {user.provider} Oauth</Text>
              )}
              <LocationInput
                mt={8}
                disabled={!isEditMode}
                defaultValue={user.location}
                label="Location"
                placeholder="Enter your location"
                onPlaceChange={(place: any) => {
                  setSelectedLocation(place);
                }}
              />
            </Container>
            <Container className={classes.simpleGrid} mt={8}>
              <Text className={classes.header}>Alerts</Text>
              <Divider />
              <Switch
                mt={8}
                {...form.getInputProps("alertsEnabled")}
                disabled={!isEditMode}
                labelPosition="left"
                label="Alerts Enabled"
                color="gray"
                checked={form.values.alertsEnabled}
              />
              {form.values.alertsEnabled && (
                <>
                  <Text size="sm" mt={8}>
                    Alert Distance: <b>{form.values.alertDistance} km</b>
                  </Text>
                  <Slider
                    color="gray"
                    label={null}
                    {...form.getInputProps("alertDistance")}
                    min={1}
                    max={200}
                    disabled={!isEditMode}
                  />
                  <TextInput
                    my={8}
                    placeholder="Email for Alerts"
                    description="Leave blank to use account email"
                    label="Alert Email"
                    {...form.getInputProps("alertEmail")}
                    disabled={!isEditMode}
                  />
                  <label style={{ display: "block", fontWeight: "500" }}>
                    Sms Alert
                  </label>
                  <PhoneInput
                    country="au"
                    disabled={!isEditMode}
                    value={phone}
                    countryCodeEditable={false}
                    onChange={(value: string) => setPhone(value)}
                    enableSearch
                    inputStyle={{ color: "black" }}
                  />
                </>
              )}
            </Container>
          </Container>
          <Divider mt="md" />
          <Group position="center" my="md">
            {!isEditMode ? (
              <></>
            ) : (
              <>
                <Button variant="default" loading={loading} type="submit">
                  Submit
                </Button>
                <Button variant="default" onClick={handleCancel}>
                  Cancel
                </Button>
              </>
            )}
          </Group>
          {!isEditMode && (
            <>
              <Overlay
                center
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 1,
                }}
              >
                <Button
                  variant="default"
                  style={{ zIndex: 2 }}
                  onClick={handlePreferences}
                >
                  Edit Preferences
                </Button>
              </Overlay>
            </>
          )}
        </form>
        <Container className={classes.mainform} my="md">
          <Container className={classes.simpleGrid} mt={8}>
            <Text className={classes.header}>Verified Organisation</Text>
            <Divider />

            {user.verifyStatus === "pending" && (
              <Text>Your verification request is pending.</Text>
            )}
            {user.verifyStatus === "declined" && (
              <Text>
                Your verification request was declined. You can request
                verification again.
              </Text>
            )}
            {user.verifyStatus === "approved" && (
              <Text>You are a verified organization.</Text>
            )}
            {(user.verifyStatus === "none" ||
              user.verifyStatus === "declined") && (
              <Group position="center" my="md">
                <Button variant="default" onClick={() => setModalOpen(true)}>
                  Request verification for organisation
                </Button>
              </Group>
            )}
          </Container>
        </Container>
      </Container>
    </>
  );
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await auth(context.req, context.res);
  if (!session || !session.user.id) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME);
  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(session.user.id) });

  if (!user) {
    return {
      notFound: true,
    };
  }
  console.log(JSON.parse(JSON.stringify(user)));
  return {
    props: {
      user: JSON.parse(JSON.stringify(user)),
    },
  };
}
