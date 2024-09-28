import React, { Suspense, useState } from "react";
import Login from "../Login";

// admin
import {
  AdminDashboard,
  AdminAnnouncement,
  AdminManageClient,
  AdminReports,
  AdminMedication,
  AdminFamilyPlanning,
  AdminPregnant,
  AdminViewMap,
  AdminViewCateoryTable,
} from "./admin/index";
// admin
import { WorkerDashboard, WorkerList } from "./worker/index";

import { Route, Routes } from "react-router-dom";
import Rootlayout from "../../layout/Rootlayout";
import { routesType } from "../../types";

const PrivateRoutes = () => {
  const userRoutes = {
    admin: [
      {
        path: "/",
        element: <AdminDashboard />,
      },
      {
        path: "/client-list",
        element: <AdminManageClient />,
      },
      {
        path: "/medication",
        element: <AdminMedication />,
      },
      {
        path: "/view-category",
        element: <AdminViewCateoryTable />,
      },
      {
        path: "/announcement",
        element: <AdminAnnouncement />,
      },
      {
        path: "/reports",
        element: <AdminReports />,
      },
      {
        path: "/family-planning",
        element: <AdminFamilyPlanning />,
      },
      {
        path: "/pregnant",
        element: <AdminPregnant />,
      },
      {
        path: "/view-map",
        element: <AdminViewMap />,
      },
    ],
    worker: [
      {
        path: "/",
        element: <WorkerDashboard />,
      },
      {
        path: "/list",
        element: <WorkerList />,
      },
    ],
  };

  const [role, setRole] = useState<"admin" | "worker">("admin");
  const isLogged = true;

  const userPath = userRoutes.admin;

  console.log(userPath);

  return (
    <>
      <Routes>
        {!isLogged ? (
          <Route
            path="/"
            element={
              <Suspense fallback={<center>Loading</center>}>
                <Login />
              </Suspense>
            }
          />
        ) : (
          <Route path="/" element={<Rootlayout role={role} />}>
            {userPath.map(({ path, element }: routesType, index: number) => (
              <Route key={index} path={path} element={element} />
            ))}
          </Route>
        )}
      </Routes>
    </>
  );
};

export default PrivateRoutes;
