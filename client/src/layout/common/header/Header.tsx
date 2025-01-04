// src/components/header/Header.tsx

import React, { useEffect, useState, FC } from "react";
import { HiMenuAlt4 } from "react-icons/hi";

import Avatar from "../../../components/ui/Avatar";
import Logs from "../../../components/headerContent/Logs";
import Notification from "../../../components/headerContent/Notification";
import SidebarMobile from "../sidebar/SidebarMobile";
import WorkerNotification from "../../../components/headerContent/WorkerNotification";

interface HeaderProps {
  role: "admin" | "worker";
}

const Header: FC<HeaderProps> = ({ role }) => {
  // Explicitly use React here to ensure it's considered used:
  console.log("React Version:", React.version);

  const [isOpenSidebar, setIsOpenSidebar] = useState<boolean>(false);
  const [unreadHelpRequests, setUnreadHelpRequests] = useState<number>(0);
  const [helpRequests, setHelpRequests] = useState([]);
  const [workerId, setWorkerId] = useState<string>("");

  useEffect(() => {
    const id = sessionStorage.getItem("id");
    if (id) {
      setWorkerId(id);
    }

    const fetchUnreadHelpRequests = async () => {
      try {
        const response = await fetch("https://health-center-repo-production.up.railway.app/getUnreadHelpRequests");
        if (!response.ok) {
          throw new Error("Failed to fetch unread help requests");
        }
        const data = await response.json();
        setUnreadHelpRequests(data.count);
      } catch (error) {
        console.error("Error fetching unread help requests:", error);
      }
    };

    const fetchHelpRequests = async () => {
      try {
        const response = await fetch("https://health-center-repo-production.up.railway.app/getAllHelpRequests");
        if (!response.ok) {
          throw new Error("Failed to fetch help requests");
        }
        const data = await response.json();
        setHelpRequests(data);
      } catch (error) {
        console.error("Error fetching help requests:", error);
      }
    };

    fetchUnreadHelpRequests();
    fetchHelpRequests();
  }, []);

  const handleMarkAsRead = async () => {
    try {
      const response = await fetch("https://health-center-repo-production.up.railway.app/markHelpRequestsRead", {
        method: "PUT",
      });
      if (!response.ok) {
        throw new Error("Failed to mark help requests as read");
      }
      setUnreadHelpRequests(0);
    } catch (error) {
      console.error("Error marking help requests as read:", error);
    }
  };

  return (
    <div className="header h-[80px] bg-white shadow-md shadow-slate-100 flex items-center justify-between px-7 ">
      <button onClick={() => setIsOpenSidebar(!isOpenSidebar)} className="md:hidden">
        <HiMenuAlt4 size={35} />
      </button>
      {isOpenSidebar && <SidebarMobile role={role} onClose={() => setIsOpenSidebar(false)} />}

      <h1 className="hidden md:flex text-green-500 font-medium text-lg items-center gap-1">
        Happy to see you, stay safe{" "}
        <img src="/image.webp" className="w-14" alt="Smiley Face" />
      </h1>
      <div className="flex items-center gap-5">
        {role === "worker" && <Logs />}
        {role === "admin" && (
          <Notification
            unreadCount={unreadHelpRequests}
            onClick={handleMarkAsRead}
            title="Help Requests"
            helpRequests={helpRequests}
            description={`You have ${unreadHelpRequests} unread help requests.`}
          />
        )}

        {role === "worker" && workerId && <WorkerNotification workerId={workerId} />}
        <Avatar unreadMessages={0} setUnreadMessages={() => {}} />
      </div>
    </div>
  );
};

export default Header;
