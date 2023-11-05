import {
  Button,
  Group,
  TextInput,
  Text,
  createStyles,
  rem,
  Divider,
  Textarea,
  Container,
  Select,
  Avatar,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { forwardRef, useState } from "react";
import { LocationInput } from "../components/LocationInput";
import { Notifications } from "@mantine/notifications";
import { GoogleMap, Marker } from "@react-google-maps/api";

const data = [
  {
    value: "EQ",
    label: "Earthquake",
    image: "/images/earthquake.svg",
  },
  { value: "VO", label: "Volcano", image: "/images/volcano.svg" },
  {
    value: "TC",
    label: "Tropical Cyclone",
    image: "/images/tornado.svg",
  },
  {
    value: "WF",
    label: "Wild Fire",
    image: "/images/fire.svg",
  },
  {
    value: "DR",
    label: "Drought",
    image: "/images/drought.svg",
  },
  {
    value: "TS",
    label: "Tsunami",
    image: "/images/tsunami.svg",
  },
  {
    value: "FL",
    label: "Flood",
    image: "/images/flood.svg",
  },
];

interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
  image: string;
  label: string;
  description: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ image, label, description, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Avatar src={image} />
        <Text size="sm">{label}</Text>
      </Group>
    </div>
  )
);

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
    fontSize: theme.fontSizes.sm,
    alignItems: "center",
    flexGrow: 1,
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

export default function AlertForm() {
  const [useMap, setUseMap] = useState(true);

  const form = useForm({
    initialValues: {
      title: "",
      description: "",
      alertType: "",
      alertLevel: "",
    },
    validate: {
      title: (value) => (!value ? "Title is required" : null),
      description: (value) => (!value ? "Description is required" : null),
      alertType: (value) => (!value ? "Alert type is required" : null),
      alertLevel: (value) => (!value ? "Alert level is required" : null),
    },
  });
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
  } | null>(null);
  const geocoder = new google.maps.Geocoder();
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng == null) {
      return;
    }
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results) {
        geocoder.geocode(
          { address: results[0].formatted_address },
          (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results) {
              const address = results[0].formatted_address;
              console.log(results); 
            } else {
              console.error(
                "Geocode was not successful for the following reason: " + status
              );
            }
          }
        );
        const address = results[0].formatted_address;
        setSelectedLocation({
          address,
          lat,
          lng,
        });
      } else {
        console.error(
          "Geocode was not successful for the following reason: " + status
        );
      }
    });
  };
  async function handleSubmit(values: {
    title: string;
    description: string;
    alertType: string;
    alertLevel: string;
  }) {
    try {
      setLoading(true);
      const response = await fetch("/api/createAlert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          lat: selectedLocation?.lat,
          lng: selectedLocation?.lng,
        }),
      });
      await response.json();
      Notifications.show({
        title: "Created an alert",
        message: "You have successfully created an alert!",
        color: "green",
      });
      form.reset();
    } catch (error) {
      console.error("There was an error sending the request:", error);
    } finally {
      setLoading(false);
    }
  }

  const { classes } = useStyles();
  return (
    <form
      onSubmit={form.onSubmit(async (values) => await handleSubmit(values))}
      className={classes.mainform}
    >
      <Container className={classes.simpleGrid}>
        <Text className={classes.header}>Alert Details</Text>
        <Divider />
        <TextInput
          mt={8}
          placeholder="title"
          label="Title"
          {...form.getInputProps("title")}
        />
        <Textarea
          mt={8}
          label="Description"
          placeholder="description"
          {...form.getInputProps("description")}
        />
        {!useMap ? (
          <LocationInput
            mt={8}
            label={
              <Group>
                <Text fw={500}>Location</Text>
                <Button variant="unstyled" onClick={() => setUseMap(true)}>
                  Use Map
                </Button>
              </Group>
            }
            placeholder="Alert location"
            onPlaceChange={(place: any) => {
              setSelectedLocation(place);
            }}
          />
        ) : (
          <>
            <Group mt={8}>
              <Text fw={500}>Location</Text>
              <Button variant="unstyled" onClick={() => setUseMap(false)}>
                Use Text
              </Button>
            </Group>
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "300px" }}
              center={
                selectedLocation
                  ? { lat: selectedLocation.lat, lng: selectedLocation.lng }
                  : { lat: -25, lng: 130 }
              }
              zoom={2}
              onClick={handleMapClick}
            >
              {selectedLocation && <Marker position={selectedLocation} />}
            </GoogleMap>
          </>
        )}

        <Select
          searchable
          clearable
          mt={8}
          label="Alert Type"
          placeholder="Alert Type"
          itemComponent={SelectItem}
          {...form.getInputProps("alertType")}
          data={data}
        />
        <Select
          mt={8}
          label="Alert Level"
          placeholder="Alert Level"
          {...form.getInputProps("alertLevel")}
          data={[
            { value: "Green", label: "Green" },
            { value: "Orange", label: "Orange" },
            { value: "Red", label: "Red" },
          ]}
        />
      </Container>
      <Divider mt="md" />
      <Group position="center" my="md">
        <Button variant="default" loading={loading} type="submit">
          Create
        </Button>
      </Group>
    </form>
  );
}
