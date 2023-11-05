import { ActionIcon, Button, Group } from "@mantine/core";
import { signIn } from "next-auth/react";
import {
  IconBrandTwitter,
  IconBrandGmail,
  IconBrandFacebook,
} from "@tabler/icons-react";

const providers = {
  google: {
    id: "google",
    name: "Google",
    type: "oauth",
    signinUrl: "/api/auth/signin/google",
    callbackUrl: "/api/auth/callback/google",
    icon: <IconBrandGmail />,
  },
  facebook: {
    id: "facebook",
    name: "Facebook",
    type: "oauth",
    signinUrl: "/api/auth/signin/facebook",
    callbackUrl: "/api/auth/callback/facebook",
    icon: <IconBrandFacebook />,
  },
  twitter: {
    id: "twitter",
    name: "Twitter",
    type: "oauth",
    signinUrl: "/api/auth/signin/twitter",
    callbackUrl: "/api/auth/callback/twitter",
    icon: <IconBrandTwitter />,
  },
};

export function Providers() {
  return (
    <Group position="center" pt="md" grow spacing="lg">
      {Object.values(providers).map((provider) => (
        <Button
          variant="default"
          key={provider.name}
          onClick={() => signIn(provider.id)}
        >
          <ActionIcon>{provider.icon}</ActionIcon>
        </Button>
      ))}
    </Group>
  );
}
