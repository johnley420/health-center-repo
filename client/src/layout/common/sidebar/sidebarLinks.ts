import { RxDashboard } from "react-icons/rx";
import { FiUsers } from "react-icons/fi";
import { AiOutlineMedicineBox } from "react-icons/ai";
import { MdOutlineInventory2 } from "react-icons/md";
import { LuUsers } from "react-icons/lu";
import { TfiAnnouncement } from "react-icons/tfi";
import { FiMap } from "react-icons/fi";


export const userLinks = {
  worker: [
    {
      path: "/",
      label: "Overview",
      Icon: RxDashboard,
    },

    {
      path: "/client-list",
      label: "Manage Client",
      Icon: LuUsers,
    },
    {
      path: "/medication",
      label: "Medication Update",
      Icon: AiOutlineMedicineBox,
    },
    {
      path: "/announcement",
      label: "Announcement",
      Icon: TfiAnnouncement,
    },
  ],
  admin: [
  {
    path: "/",
    label: "Dashboard",
    Icon: RxDashboard,
  },
  {
    path: "/list",
    label: "Manage Workers",
    Icon: FiUsers,
  },
  {
    path: "/view-map",
    label: "Map",
    Icon: /* Add a map icon component here, e.g., */ FiMap,
  },
  {
    path: "/announcement",
    label: "Announcement",
    Icon: TfiAnnouncement,
  },
  {
    path: "/inventory",
    label: "Inventory",
    Icon: MdOutlineInventory2,
  },
],

};
