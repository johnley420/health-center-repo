import { Checkbox, Input, Select, SelectItem } from "@nextui-org/react";
import React from 'react';

export const ZEROTO9CHILDMONTHFORM = () => {
  return (
    <div className="p-6">
      <form>
        <div className="space-y-6">

          {/* Date of Registration and PWD Number */}
          <div className="flex flex-col space-y-2">
            <label htmlFor="dateOfRegistration" className="font-semibold">Date of Registration</label>
            <Input type="date" id="dateOfRegistration" fullWidth />
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="pwdNumber" className="font-semibold">PWD Number</label>
            <Input id="pwdNumber" fullWidth />
          </div>

          {/* NHTS-PR Section */}
          <h2 className="text-xl font-bold mt-6">NHTS-PR Information</h2>
          <div className="flex flex-wrap gap-4">
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

          {/* Indigenous People */}
          <div className="flex items-center space-x-2 mt-4">
            <label htmlFor="indigenousPeople" className="font-semibold">Indigenous People</label>
            <Checkbox id="indigenousPeople" />
          </div>

          {/* Client Name Section */}
          <h2 className="text-xl font-bold mt-6">Client Name</h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <Input label="LAST NAME" fullWidth />
            </div>
            <div className="flex-1">
              <Input label="FIRST NAME" fullWidth />
            </div>
            <div className="flex-1">
              <Input label="MIDDLE NAME" fullWidth />
            </div>
          </div>

          {/* Sex Selection */}
          <div className="flex flex-col mt-4 space-y-2">
            <Select placeholder="Sex" fullWidth>
              <SelectItem key="Male">Male</SelectItem>
              <SelectItem key="Female">Female</SelectItem>
            </Select>
          </div>

          {/* Complete Address Section */}
          <h2 className="text-xl font-bold mt-6">Complete Address</h2>
          <div className="flex flex-wrap gap-4">
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
          
        </div>
      </form>
    </div>
  );
};
