import React from "react";

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Image,
} from "@nextui-org/react";

const SidebarCard = () => {
  return (
    <Card className="max-w-[400px] bg-green-500">
      <CardHeader className="flex gap-3">
        <Image
          alt="nextui logo"
          height={40}
          radius="sm"
          src="/logo2.png"
          width={40}
        />
        <div className="flex flex-col">
          <p className="text-md text-green-100 text-xl font-semibold">
            Welcome
          </p>
          <p className="text-small text-green-200">Wellness Center</p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <p className="text-green-100">Your partner in health and wellness</p>
      </CardBody>
      <Divider />
      <CardFooter>
        <Link
          isExternal
          showAnchorIcon
          href="https://github.com/nextui-org/nextui"
          className="text-green-100 text-xs"
        >
          Supporting our community's health and care
        </Link>
      </CardFooter>
    </Card>
  );
};

export default SidebarCard;
