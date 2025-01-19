import React, { useEffect, useState } from "react";
import Login from "../Login";
import { 
  WorkerDashboard, 
  WorkerAnnouncement, 
  WorkerManageClient, 
  WorkerReports, 
  WorkerMedication, 
  WorkerFamilyPlanning, 
  WorkerPregnant, 
  WorkerViewMap, 
  WorkerViewPregnantTable,
  WorkerViewPersonWithDisabilityTable,
  WorkerView10to19yoTable,
  WorkerViewWRATable,
  WorkerViewHypertensive,
  WorkerView0to59MonthsOldTable,
  WorkerViewSeniorCetizenTable,
  WorkerViewFilariasisTable,
  WorkerView5to9YearsOldTable,
  WorkerView0to11MonthsOldTable,
  WorkerViewSchistomiasisTable,
  WorkerViewCurrentSmokers,
  WorkerView0to59YearsOldTable
} from "./worker/index";

import { 
  AdminDashboard, 
  AdminInventroy, 
  AdminList, 
  AdminMapping, 
  AdminReports, 
  AdminViewMap, 
  AdminAnnouncement 
} from "./admin/index";

import { Route, Routes, Navigate } from "react-router-dom";
import Rootlayout from "../../layout/Rootlayout";
import { routesType } from "../../types";
import AdminOnlineForm from "../../components/modals/add/AdminOnlineForm";
import ForgotAdminPassword from "../ForgotAdminPassword";

// Import your publicly accessible component (AdminOnlineForm) 
// Ensure you've created this component and placed it in the correct directory


const PrivateRoutes = () => {
  console.log("React version:", React.version);

  const [role, setRole] = useState<"admin" | "worker" | null>(null);

  useEffect(() => {
    const savedRole = sessionStorage.getItem("userRole");
    console.log("Retrieved role from sessionStorage:", savedRole);
    if (savedRole === "admin" || savedRole === "worker") {
      setRole(savedRole as "admin" | "worker");
    } else {
      setRole(null);
    }
  }, []);

  const userRoutes = {
    worker: [
      { path: "/", element: <WorkerDashboard /> },
      { path: "/client-list", element: <WorkerManageClient /> },
      { path: "/medication", element: <WorkerMedication /> },
      { path: "/view-pregnant", element: <WorkerViewPregnantTable /> },
      { path: "/view-PWD", element: <WorkerViewPersonWithDisabilityTable /> },
      { path: "/view-10to19", element: <WorkerView10to19yoTable /> },
      { path: "/view-WRA", element: <WorkerViewWRATable /> },
      { path: "/view-hypertensive", element: <WorkerViewHypertensive /> },
      { path: "/view-0-59MO", element: <WorkerView0to59MonthsOldTable /> },
      { path: "/view-senior-citizen", element: <WorkerViewSeniorCetizenTable /> },
      { path: "/view-filariasis", element: <WorkerViewFilariasisTable /> },
      { path: "/view-0-11monthsold", element: <WorkerView0to11MonthsOldTable /> },
      { path: "/view-5-9yearsold", element: <WorkerView5to9YearsOldTable /> },
      { path: "/view-schistomiasis", element: <WorkerViewSchistomiasisTable /> },
      { path: "/view-currentsmokers", element: <WorkerViewCurrentSmokers /> },
      { path: "/view-0-59yearsold", element: <WorkerView0to59YearsOldTable /> },
      { path: "/announcement", element: <WorkerAnnouncement /> },
      { path: "/reports", element: <WorkerReports /> },
      { path: "/family-planning", element: <WorkerFamilyPlanning /> },
      { path: "/pregnant", element: <WorkerPregnant /> },
      { path: "/view-map", element: <WorkerViewMap /> },
    ],
    admin: [
      { path: "/", element: <AdminDashboard /> },
      { path: "/list", element: <AdminList /> },
      { path: "/mapping", element: <AdminMapping /> },
      { path: "/announcement", element: <AdminAnnouncement /> },
      { path: "/report", element: <AdminReports /> },
      { path: "/inventory", element: <AdminInventroy /> },
      { path: "/view-map", element: <AdminViewMap /> },
    ],
  };

  const renderRoutes = (routesArray: routesType[]) => {
    return routesArray.map(({ path, element }: routesType, index: number) => (
      <Route key={index} path={path} element={element} />
    ));
  };

  return (
    <Routes>
      {/* Public route accessible without login */}
      <Route path="/admin-online-form" element={<AdminOnlineForm />} />
       <Route path="/admin/forgot/accounts" element={<ForgotAdminPassword />} />

      {/* Login Route */}
      <Route path="/login" element={<Login setRole={setRole} />} />

      {role ? (
        <Route path="/" element={<Rootlayout role={role} />}>
          {renderRoutes(role === "worker" ? userRoutes.worker : userRoutes.admin)}
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
};

export default PrivateRoutes;
