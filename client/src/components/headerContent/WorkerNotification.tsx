// src/components/headerContent/WorkerNotification.tsx

import {
  Button,
  Card,
  CardBody,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import axios from "axios";

interface WorkerNotificationProps {
  workerId: string;
}

const WorkerNotification: React.FC<WorkerNotificationProps> = ({ workerId }) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `https://https://health-center-repo-production.up.railway.app/notifications?worker_id=${workerId}`
        );
        if (response.status === 200) {
          setNotifications(response.data);
          setUnreadCount(response.data.length);
        }
      } catch (error: any) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    // Optionally, set up polling or WebSocket for real-time updates
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [workerId]);

  const handleMarkAsRead = async () => {
    try {
      await axios.put("https://https://health-center-repo-production.up.railway.app/notifications/mark-as-read", {
        worker_id: workerId,
      });
      setUnreadCount(0);
      setNotifications([]);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  return (
    <Popover className="w-[350px]" placement="bottom" showArrow={true}>
      <PopoverTrigger className="cursor-pointer">
        <button className="outline-none relative">
          <IoNotificationsOutline size={25} className="text-green-500" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="py-4">
        <div className="flex justify-between items-center mb-5">
          <p className="text-lg font-medium">Notifications</p>
          {unreadCount > 0 && (
            <Button size="sm" color="primary" onClick={handleMarkAsRead}>
              Mark as Read
            </Button>
          )}
        </div>
        {unreadCount === 0 ? (
          <p className="text-gray-500">No notifications available.</p>
        ) : (
          <div className="w-full flex flex-col gap-4">
            {notifications.map((item: any, index: number) => (
              <Card key={index}>
                <CardBody>
                  <div className="w-full flex items-center justify-between mb-5">
                    <p className="text-lg font-medium">Missed Visit Alert</p>
                    <p className="text-xs text-green-500 py-2 px-3 bg-green-100 rounded-full">
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-gray-500">{item.message}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default WorkerNotification;
