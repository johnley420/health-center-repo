import { RxDashboard } from "react-icons/rx";
import { FiUsers } from "react-icons/fi";
import { AiOutlineMedicineBox } from "react-icons/ai";
import { HiDocumentReport } from "react-icons/hi";
import { FaPersonPregnant, FaMapLocationDot } from "react-icons/fa6";
import { MdFamilyRestroom, MdOutlineInventory2 } from "react-icons/md";
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
      path: "/medication",
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
      label: "Manage Workers",
      Icon: FiUsers,
    },
    {
      path: "/account",
      label: "Announcement",
      Icon: TfiAnnouncement,
    },
    {
      path: "/mapping",
      label: "Mapping",
      Icon: FaMapLocationDot,
    },
    {
      path: "/inventory",
      label: "Inventory",
      Icon: MdOutlineInventory2,
    },
    {
      path: "/report",
      label: "Report",
      Icon: HiDocumentReport,
    },
  ],
};
