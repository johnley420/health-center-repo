import {
  Button,
  Card,
  CardBody,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tab,
  Tabs,
} from "@nextui-org/react";
import React from "react";
import { IoCalendarOutline } from "react-icons/io5";

const Logs = () => {
  const logs = [
    { day: "Monday", date: "12/31/2001", logStatus: "absent" },
    { day: "Tuesday", date: "12/31/2001", logStatus: "present" },
    { day: "Wednesday", date: "12/31/2001", logStatus: "absent" },
    { day: "Thursday", date: "12/31/2001", logStatus: "absent" },
    { day: "Friday", date: "12/31/2001", logStatus: "present" },
  ];
  return (
    <Popover className="w-[350px]" placement="top" showArrow={true}>
      <PopoverTrigger className="cursor-pointer">
        <button className="outline-none">
          <IoCalendarOutline size={23} className="text-green-500" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="py-3">
        <Tabs aria-label="Options">
          <Tab key="logs" title="Daily Log">
            <Card>
              <CardBody className="w-[300px]">
                <p className="text-lg font-medium text-center mb-5">
                  Daily Log
                </p>
                <div className="w-full flex items-center justify-between px-3 mb-5">
                  <p className="font-semibold">Monday</p>

                  <p className="text-xs text-green-500 py-2 px-3 bg-green-100 rounded-full">
                    12/31/2024
                  </p>
                </div>
                <Button className="text-lg text-white font-medium py-3 px-3 roulg bg-green-500">
                  Time In
                </Button>
              </CardBody>
            </Card>
          </Tab>
          <Tab key="history" title="History">
            <Card className="w-full">
              <CardBody className="w-[300px]">
                <p className="text-lg font-medium text-center">History</p>
                <div className="px-3 py-4 flex flex-col gap-5 w-full">
                  {logs.map((item, index) => (
                    <div
                      key={index}
                      className="w-full flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <p>{item.day}</p>
                      </div>
                      <div
                        className={`text-lg ${
                          item.logStatus === "absent"
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {item.logStatus}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export default Logs;
