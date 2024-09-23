import { RxDashboard } from "react-icons/rx";
import { FiUsers, FiSettings } from "react-icons/fi";
import { AiOutlineBarChart, AiOutlineMedicineBox } from "react-icons/ai";
import { IoBookOutline } from "react-icons/io5";
import { FaPersonPregnant } from "react-icons/fa6";
import { MdFamilyRestroom } from "react-icons/md";
import { LuUsers } from "react-icons/lu";
import { TbReportSearch } from "react-icons/tb";
import { TfiAnnouncement } from "react-icons/tfi";

export const userLinks = {
  admin: [
    {
      path: "/",
      label: "Overview",
      Icon: RxDashboard,
      children: [
        {
          path: "/",
          label: "Overall",
          Icon: FiUsers,
        },
        {
          path: "/pregnant",
          label: "Pregnant",
          Icon: FaPersonPregnant,
        },
        {
          path: "/family-planning",
          label: "Family Planning",
          Icon: MdFamilyRestroom,
        },
      ],
    },

    {
      path: "/client-list",
      label: "Manage Client",
      Icon: LuUsers,
    },
    {
      path: "/medication-update",
      label: "Medication Update",
      Icon: AiOutlineMedicineBox,
    },
    {
      path: "/announcement",
      label: "Announcement",
      Icon: TfiAnnouncement,
    },
    {
      path: "/reports",
      label: "Reports",
      Icon: TbReportSearch,
    },
  ],
  worker: [
    {
      path: "/",
      label: "Dashboard",
      Icon: RxDashboard,
    },
    {
      path: "/list",
      label: "List",
      Icon: FiUsers,
    },
  ],
};
