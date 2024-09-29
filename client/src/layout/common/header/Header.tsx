import React from "react";

import { format } from "date-fns";

import { FcCalendar } from "react-icons/fc";

import { HiMenuAlt2 } from "react-icons/hi";
import {
  IoSearch,
  IoNotificationsOutline,
  IoCalendarOutline,
} from "react-icons/io5";
import Avatar from "../../../components/ui/Avatar";
import Logs from "../../../components/headerContent/Logs";
import Notification from "../../../components/headerContent/Notification";
const Header = () => {
  const currentDateTime = new Date();
  const monthName = format(currentDateTime, "MMMM dd, yyyy");
  return (
    <div className="header h-[80px] bg-white shadow-md shadow-slate-100  flex items-center justify-between px-7 ">
      <h1 className="text-green-500 font-medium text-lg flex items-center gap-1">
        Happy to see you, stay safe{" "}
        <img src="/image.webp" className="w-14" alt="" />
      </h1>
      <div className="flex items-center gap-5">
        <Logs />
        <Notification />
        <Avatar />
      </div>
    </div>
  );
};

export default Header;
