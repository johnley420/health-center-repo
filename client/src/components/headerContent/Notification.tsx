import {
  Card,
  CardBody,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import React from "react";
import { IoNotificationsOutline } from "react-icons/io5";

const Notification = () => {
  const notification = [
    {
      date: "12/31/2024",
      titile: "Notif titile",
      announce: "Make beautiful websites regardless of your design experience.",
    },
    {
      date: "12/31/2024",
      titile: "Notif titile",
      announce: "Make beautiful websites regardless of your design experience.",
    },
    {
      date: "12/31/2024",
      titile: "Notif titile",
      announce: "Make beautiful websites regardless of your design experience.",
    },
    {
      date: "12/31/2024",
      titile: "Notif titile",
      announce: "Make beautiful websites regardless of your design experience.",
    },
    {
      date: "12/31/2024",
      titile: "Notif titile",
      announce: "Make beautiful websites regardless of your design experience.",
    },
  ];
  return (
    <Popover className="w-[350px]" placement="bottom" showArrow={true}>
      <PopoverTrigger className="cursor-pointer">
        <button className="outline-none">
          <IoNotificationsOutline size={25} className="text-green-500" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="py-4">
        {" "}
        <p className="text-lg font-medium  mb-5">Notification</p>
        <div className="w-full flex flex-col gap-4">
          {notification.map((item, index) => (
            <Card key={index}>
              <CardBody>
                <div className="w-full flex items-center justify-between mb-5">
                  <p className="text-lg font-medium">{item.titile}</p>
                  <p className="text-xs text-green-500 py-2 px-3 bg-green-100 rounded-full">
                    {item.date}
                  </p>
                </div>
                <p className="text-gray-500">{item.announce}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Notification;
