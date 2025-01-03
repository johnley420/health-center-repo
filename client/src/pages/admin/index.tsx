import React, { useState } from "react";
import MainDashboard from "./dashboards/index";
import PersonWithDisability from "./dashboards/PersonWithDisability";
import Pregnant from "./dashboards/Pregnant";
import SchistomiasisProgramServices from "./dashboards/SchistomiasisProgramServices";
import SeniorCitizen from "./dashboards/SeniorCitizen";
import FamilyPlanning from "./dashboards/FamilyPlanning";
import HypertensiveDiabeties from "./dashboards/HypertensiveDiabeties";
import FilariasisProgramService from "./dashboards/FilariasisProgramService";
import CurrentSmokers from "./dashboards/CurrentSmokers";
import MonthsInfant011 from "./dashboards/MonthsInfant011";
import MonthsChildren059 from "./dashboards/MonthsChildren059";
import YearsScreened059 from "./dashboards/YearsScreened059";
import YearsChildren59 from "./dashboards/YearsChildren59";
import YearsOld1019 from "./dashboards/YearsOld1019";
import { Select, SelectItem } from "@nextui-org/react";

const Index: React.FC = () => {
  console.log("React version:", React.version); // Explicit usage of React

  const [value, setValue] = useState(0); // Default to 'All'

  const categoryData = [
    {
      category: "All",
      value: 0,
      component: <MainDashboard />,
    },
    {
      category: "Pregnant",
      value: 1,
      component: <Pregnant />,
    },
    {
      category: "Person With Disabilities",
      value: 2,
      component: <PersonWithDisability />,
    },
    {
      category: "Schistomiasis Program Services",
      value: 3,
      component: <SchistomiasisProgramServices />,
    },
    {
      category: "Senior Citizen",
      value: 4,
      component: <SeniorCitizen />,
    },
    {
      category: "Family Planning",
      value: 5,
      component: <FamilyPlanning />,
    },
    {
      category: "Hypertensive And Type 2 Diabetes",
      value: 6,
      component: <HypertensiveDiabeties />,
    },
    {
      category: "Filariasis Program Services",
      value: 7,
      component: <FilariasisProgramService />,
    },
    {
      category: "Current Smokers",
      value: 8,
      component: <CurrentSmokers />,
    },
    {
      category: "0-11 Months Old Infants",
      value: 9,
      component: <MonthsInfant011 />,
    },
    {
      category: "0-59 Months Old Children",
      value: 10,
      component: <MonthsChildren059 />,
    },
    {
      category: "0-59 years Old Screened For Visual Activity",
      value: 11,
      component: <YearsScreened059 />,
    },
    {
      category: "5-9 years Old Children (School Aged Children)",
      value: 12,
      component: <YearsChildren59 />,
    },
    {
      category: "10-19 Years Old (Adolescents)",
      value: 13,
      component: <YearsOld1019 />,
    },
  ];

  const handleSelectChange = (e: any) => {
    setValue(Number(e.target.value));
  };

  console.log("g", value);

  return (
    <div className="">
      <div className="flex items-center justify-between px-2 mb-5">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <Select
          label="Select Category"
          className="max-w-xs"
          onChange={handleSelectChange} // Handle value changes
          value={value} // Ensure the selected value is displayed
        >
          {categoryData.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.category}
            </SelectItem>
          ))}
        </Select>
      </div>
      {categoryData.find((item) => item.value === value)?.component}
    </div>
  );
};

export default Index;
