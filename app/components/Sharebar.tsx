import { HoverCard, Group } from "@mantine/core";
import React from "react";
import {
  EmailShareButton,
  FacebookShareButton,
  TwitterShareButton,
  EmailIcon,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  LinkedinShareButton,
} from "react-share";

export type ShareProps = {
  url: string;
  title: string;
  hoverTarget?: React.ReactNode;
};

export default function ShareBar(props: ShareProps) {
  return (
    <HoverCard withArrow withinPortal position="right" shadow={"md"}>
      <HoverCard.Target>{props.hoverTarget}</HoverCard.Target>
      <HoverCard.Dropdown>
        <Group>
          <FacebookShareButton
            url={props.url}
            title={props.title}
            className="h-auto"
          >
            <FacebookIcon size={32} round />
          </FacebookShareButton>

          <TwitterShareButton
            url={props.url}
            title={props.title}
            className="h-auto"
          >
            <TwitterIcon size={32} round />
          </TwitterShareButton>

          <LinkedinShareButton
            url={props.url}
            title={props.title}
            className="h-auto"
          >
            <LinkedinIcon size={32} round />
          </LinkedinShareButton>
          <EmailShareButton
            url={props.url}
            title={props.title}
            className="h-auto"
          >
            <EmailIcon size={32} round />
          </EmailShareButton>
        </Group>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
