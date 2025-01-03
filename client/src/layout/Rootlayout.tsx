import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./common/sidebar/Sidebar";
import Header from "./common/header/Header";

interface RootLayoutProps {
  role: "worker" | "admin";
}

const Rootlayout: React.FC<RootLayoutProps> = ({ role }) => {
  console.log("React version:", React.version); // Explicit usage of React

  return (
    <div className="fixed top-0 left-0 w-screen">
      <div className="flex h-screen overflow-hidden">
        <Sidebar role={role} />
        <div className="flex-1 flex flex-col overflow-hidden gap-2 bg-green-50">
          <Header role={role} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-green-50 px-5 py-3">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Rootlayout;
