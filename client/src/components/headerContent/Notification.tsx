import React from "react";
import {
  Card,
  CardBody,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { IoNotificationsOutline } from "react-icons/io5";

interface NotificationProps {
  unreadCount: number;
  onClick: () => void;
  helpRequests: Array<any>;
  title: string;
  description: string;
}

const Notification: React.FC<NotificationProps> = ({
  unreadCount,
  onClick,
  helpRequests,
  title,
  description,
}) => {
  return (
    <Popover className="w-[350px]" placement="bottom" showArrow={true}  offset={20}>
      <PopoverTrigger className="cursor-pointer" onClick={onClick}>
        <button className="outline-none relative">
          <IoNotificationsOutline size={25} className="text-green-500" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      {/* Set a max-height and scroll on overflow */}
      <PopoverContent className="mt-2 py-4 min-h-[300px] max-h-[500px] overflow-y-auto">
        <p className="text-lg font-medium mb-5">{title}</p>
        <p className="text-gray-500 mb-4">{description}</p>

        <div className="w-full flex flex-col gap-4">
          {helpRequests.length === 0 ? (
            <p className="text-gray-500">No help requests available.</p>
          ) : (
            helpRequests.map((item: any, index: number) => (
              <Card key={index}>
                <CardBody>
                  <div className="w-full flex items-center justify-between mb-5">
                    <p className="text-lg font-medium">{item.full_name} requests help</p>
                    <p className="text-xs text-green-500 py-2 px-3 bg-green-100 rounded-full">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-gray-500">Reason: {item.login_issue}</p>
                  <p className="text-gray-500">Address: {item.address}</p>
                  <p className="text-gray-500">Place Assigned: {item.place_assign}</p>
                  <p className="text-gray-500">Phone Number: {item.phone_number}</p>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Notification;
