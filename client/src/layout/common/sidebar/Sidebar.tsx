import React, { useState } from "react";

import SidebarCard from "../../../components/Cards/SidebardCard";

import { roleType } from "../../../types";
import Content from "./Content";

const Sidebar: React.FC<roleType> = ({ role }) => {
  // Explicitly use React to ensure it's considered used
  console.log("React version:", React.version);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="hidden md:flex w-80 h-screen bg-green-100 shadow-lg px-5 py-7 flex-col justify-between">
      <Content
        expandedIndex={expandedIndex}
        handleToggle={handleToggle}
        role={role}
        setExpandedIndex={() => setExpandedIndex(null)}
      />
      <SidebarCard />
    </div>
  );
};

export default Sidebar;
