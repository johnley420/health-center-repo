// src/components/dashboard/PrintTable.tsx

import React from "react";

interface JoinedData {
  fname: string;
  address: string;
  gender: string;
  dirthdate: string;
  age: number;
  pwd_number: string;
  nhts_pr_id: string;
  cct_id_number: string;
  phic_id_number: string;
  indigenous_people: string;
  ethnic_group: string;
  civil_status: string;
  height: number;
  weight: number;
  bmi: number;
  educational_attainment: string;
  occupation: string;
  employment_status: string;
  type_of_disability: string;
}

interface Props {
  data: JoinedData[];
}

const PrintTable: React.FC<Props> = ({ data }) => {
  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4 text-center">Person With Disabilities Data</h1>
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-gray-300 px-2 py-1">#</th>
            <th className="border border-gray-300 px-2 py-1">First Name</th>
            <th className="border border-gray-300 px-2 py-1">Address</th>
            <th className="border border-gray-300 px-2 py-1">Gender</th>
            <th className="border border-gray-300 px-2 py-1">Birthdate</th>
            <th className="border border-gray-300 px-2 py-1">Age</th>
            <th className="border border-gray-300 px-2 py-1">PWD Number</th>
            <th className="border border-gray-300 px-2 py-1">NHTS PR ID</th>
            <th className="border border-gray-300 px-2 py-1">CCT ID Number</th>
            <th className="border border-gray-300 px-2 py-1">PHIC ID Number</th>
            <th className="border border-gray-300 px-2 py-1">Indigenous People</th>
            <th className="border border-gray-300 px-2 py-1">Ethnic Group</th>
            <th className="border border-gray-300 px-2 py-1">Civil Status</th>
            <th className="border border-gray-300 px-2 py-1">Height</th>
            <th className="border border-gray-300 px-2 py-1">Weight</th>
            <th className="border border-gray-300 px-2 py-1">BMI</th>
            <th className="border border-gray-300 px-2 py-1">Educational Attainment</th>
            <th className="border border-gray-300 px-2 py-1">Occupation</th>
            <th className="border border-gray-300 px-2 py-1">Employment Status</th>
            <th className="border border-gray-300 px-2 py-1">Type of Disability</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
              <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>
              <td className="border border-gray-300 px-2 py-1">{item.fname}</td>
              <td className="border border-gray-300 px-2 py-1">{item.address}</td>
              <td className="border border-gray-300 px-2 py-1">{item.gender}</td>
              <td className="border border-gray-300 px-2 py-1">{item.dirthdate}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{item.age}</td>
              <td className="border border-gray-300 px-2 py-1">{item.pwd_number}</td>
              <td className="border border-gray-300 px-2 py-1">{item.nhts_pr_id}</td>
              <td className="border border-gray-300 px-2 py-1">{item.cct_id_number}</td>
              <td className="border border-gray-300 px-2 py-1">{item.phic_id_number}</td>
              <td className="border border-gray-300 px-2 py-1">{item.indigenous_people}</td>
              <td className="border border-gray-300 px-2 py-1">{item.ethnic_group}</td>
              <td className="border border-gray-300 px-2 py-1">{item.civil_status}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{item.height}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{item.weight}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{item.bmi}</td>
              <td className="border border-gray-300 px-2 py-1">{item.educational_attainment}</td>
              <td className="border border-gray-300 px-2 py-1">{item.occupation}</td>
              <td className="border border-gray-300 px-2 py-1">{item.employment_status}</td>
              <td className="border border-gray-300 px-2 py-1">{item.type_of_disability}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PrintTable;
