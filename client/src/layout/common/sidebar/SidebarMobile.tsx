import React, { useState } from "react";


import Content from "./Content";
import { TiTimes } from "react-icons/ti";

type PropsType = {
  role: "admin" | "worker";
  onClose: () => void;
};

const SidebarMobile: React.FC<PropsType> = ({ role, onClose }) => {
  console.log("React version:", React.version); // Explicit usage of React

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="md:hidden w-full fixed top-0 left-0 transition-all duration-200 ease-in-out z-50 h-screen bg-green-100 shadow-lg px-5 py-7 flex-col justify-between">
      <button className="absolute top-9 right-3" onClick={onClose}>
        <TiTimes size={35} className="text-red-500" />
      </button>
      <div onClick={onClose}>
        <Content
          expandedIndex={expandedIndex}
          handleToggle={handleToggle}
          role={role}
          setExpandedIndex={() => setExpandedIndex(null)}
        />
      </div>
    </div>
  );
};

export default SidebarMobile;
