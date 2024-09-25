import React, { useState } from "react";
import { userLinks } from "./sidebarLinks";
import { NavLink } from "react-router-dom";
import { Avatar } from "@nextui-org/react";
import SidebarCard from "../../../components/Cards/SidebardCard";
import { FaAngleDown } from "react-icons/fa";
import { roleType, sidebarTypes } from "../../../types";

const Sidebar = ({ role }: roleType) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="w-80 h-screen bg-green-100 shadow-lg px-5 py-7 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-5 mb-12">
          <Avatar src="/logo.png" size="lg" />
          <h1 className="text-2xl font-semibold">Health Center</h1>
        </div>

        <ul className="flex flex-col gap-5">
          {userLinks[role]?.map(
            ({ path, label, Icon, children }: sidebarTypes, index: number) => (
              <li key={index}>
                {children ? (
                  <div
                    className={`w-full rounded-lg transition-all ${
                      expandedIndex === index
                        ? "bg-green-200"
                        : "bg-transparent"
                    }`}
                  >
                    <div
                      onClick={() => handleToggle(index)}
                      className="link flex items-center gap-3 p-4 rounded-xl cursor-pointer justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <Icon size={20} />
                        <p className="text-lg tracking-wider">{label}</p>
                      </div>
                      <FaAngleDown
                        size={18}
                        className={`transform transition-transform duration-300 text-green-500 ${
                          expandedIndex === index ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                    {expandedIndex === index && (
                      <div className="pt-3 pb-2 px-5 flex flex-col gap-3  ">
                        {children.map((childLink: sidebarTypes, i: number) => (
                          <NavLink
                            key={i}
                            to={childLink.path}
                            className="link relative  flex items-center gap-3 p-3 rounded-2xl transition-all duration-500 ease-in-out"
                          >
                            <childLink.Icon
                              size={20}
                              className="text-gray-700d"
                            />
                            <p className="text-lg tracking-wider">
                              {childLink.label}
                            </p>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={path}
                    onClick={() => setExpandedIndex(null)}
                    className="link relative  flex items-center gap-3 p-4 rounded-xl"
                  >
                    <Icon size={20} />
                    <p className="text-lg tracking-wider">{label}</p>
                  </NavLink>
                )}
              </li>
            )
          )}
        </ul>
      </div>

      <SidebarCard />
    </div>
  );
};

export default Sidebar;
