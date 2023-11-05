import { Button, Group, TextInput, Text } from "@mantine/core";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useState } from "react";
import { usePlacesWidget } from "react-google-autocomplete";

export function LocationInput(props: any) {
  const { ref } = usePlacesWidget({
    onPlaceSelected: (place) => {
      if (place.geometry && place.geometry.location) {
        props.onPlaceChange({
          address: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    },
  });

  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng == null) {
      return;
    }
    const coords = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setSelectedCoords(coords);
    if (props.onPlaceChange) {
      props.onPlaceChange({
        address: "Manually selected location",
        ...coords,
      });
    }
  };

  return !props.useMap ? (
    <TextInput ref={ref} {...props} />
  ) : (
    <>
      <Group mt={8}>
        <Text fw={500}>Location</Text>
        <Button variant="unstyled" onClick={() => props.setUseMap(false)}>
          Use Text
        </Button>
      </Group>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "300px" }}
        center={
          selectedCoords
            ? { lat: selectedCoords.lat, lng: selectedCoords.lng }
            : { lat: -25, lng: 130 }
        }
        zoom={4}
        onClick={handleMapClick}
      >
        {selectedCoords && <Marker position={selectedCoords} />}
      </GoogleMap>
    </>
  );
}
