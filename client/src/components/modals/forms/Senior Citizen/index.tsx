import { Checkbox, DatePicker, Input, Select, SelectItem } from "@nextui-org/react";
import React from 'react';

export const SeniorCitizenForm = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Senior Citizen Form</h1>
      <div>
        {/* Date of Registration */}
        <div className="mb-4">
          <label htmlFor="registrationDate" className="block font-medium mb-1">Date of Registration</label>
          <Input type="date" id="registrationDate" fullWidth />
        </div>

        {/* PWD Number */}
        <div className="mb-4">
          <label htmlFor="pwdNumber" className="block font-medium mb-1">PWD Number</label>
          <Input type="text" id="pwdNumber" fullWidth placeholder="Enter PWD Number" />
        </div>

        <h2 className="text-xl font-semibold mt-6">NHTS-PR</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1">
            <Input label="NHTS-PR ID NUMBER" fullWidth />
          </div>
          <div className="flex-1">
            <Input label="4Ps/CCT ID NUMBER" fullWidth />
          </div>
          <div className="flex-1">
            <Input label="PHIC ID NUMBER" fullWidth />
          </div>
        </div>

        {/* Indigenous People Checkbox */}
        <div className="mb-4">
          <label htmlFor="indigenousPeople" className="flex items-center">
            <Checkbox id="indigenousPeople" className="mr-2" />
            Indigenous People
          </label>
        </div>

        <h2 className="text-xl font-semibold mt-6">Client Name</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1">
            <Input label="Last Name" fullWidth />
          </div>
          <div className="flex-1">
            <Input label="First Name" fullWidth />
          </div>
          <div className="flex-1">
            <Input label="Middle Name" fullWidth />
          </div>
        </div>

        {/* Sex Selection */}
        <div className="mb-4">
          <Select placeholder="Select Sex" fullWidth>
            <SelectItem key="male">Male</SelectItem>
            <SelectItem key="female">Female</SelectItem>
          </Select>
        </div>

        <h2 className="text-xl font-semibold mt-6">Complete Address</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1">
            <Input label="Purok" fullWidth />
          </div>
          <div className="flex-1">
            <Input label="Barangay" fullWidth />
          </div>
          <div className="flex-1">
            <Input label="Mun/City" fullWidth />
          </div>
        </div>

        {/* OSCA ID Number */}
        <div className="mb-4">
          <Input label="OSCA ID NUMBER" fullWidth />
        </div>

        {/* Pneumococcal Vaccine */}
        <h2 className="text-xl font-semibold mt-6">Pneumococcal Vaccine</h2>
        <div className="flex gap-4 flex-wrap mb-4">
          <div className="flex-1">
            <DatePicker label="1st Dose" fullWidth />
          </div>
          <div className="flex-1">
            <DatePicker label="2nd Dose" fullWidth />
          </div>
        </div>

        {/* Influenza Vaccine */}
        <h2 className="text-xl font-semibold mt-6">Influenza Vaccine</h2>
        <div className="flex gap-4 flex-wrap mb-4">
          <div className="flex-1">
            <DatePicker label="1st Dose" fullWidth />
          </div>
          <div className="flex-1">
            <DatePicker label="2nd Dose" fullWidth />
          </div>
          <div className="flex-1">
            <DatePicker label="3rd Dose" fullWidth />
          </div>
          <div className="flex-1">
            <DatePicker label="4th Dose" fullWidth />
          </div>
          <div className="flex-1">
            <DatePicker label="5th Dose" fullWidth />
          </div>
        </div>
      </div>
    </div>
  );
};
