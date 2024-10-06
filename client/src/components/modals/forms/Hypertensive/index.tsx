import { Checkbox, Input, Select, SelectItem } from '@nextui-org/react';
import React from 'react';

export const HypertensiveForm = () => {
  return (
    <div className="p-4 max-w-2xl bg-white rounded-lg">

      {/* Registration Details */}
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">Registration Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dateOfRegistration" className="block text-sm font-medium">Date of Registration</label>
            <Input type="date" id="dateOfRegistration" fullWidth />
          </div>
          <div>
            <label htmlFor="pwdNumber" className="block text-sm font-medium">PWD Number</label>
            <Input type="text" id="pwdNumber" fullWidth />
          </div>
        </div>
      </section>

      {/* NHTS-PR Information */}
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">NHTS-PR</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="NHTS-PR ID NUMBER" fullWidth />
          <Input label="4Ps/CCT ID NUMBER" fullWidth />
          <Input label="PHIC ID NUMBER" fullWidth />
        </div>
        <div className="mt-4">
          <label htmlFor="indigenousPeople" className="flex items-center">
            <Checkbox id="indigenousPeople" />
            <span className="ml-2 text-sm">INDIGENOUS PEOPLE</span>
          </label>
        </div>
      </section>

      {/* Client Name */}
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">Client Name</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="LAST NAME" fullWidth />
          <Input label="FIRST NAME" fullWidth />
          <Input label="MIDDLE NAME" fullWidth />
        </div>
        <div className="mt-4">
          <Select placeholder="Sex" fullWidth>
            <SelectItem key="Male">Male</SelectItem>
            <SelectItem key="Female">Female</SelectItem>
          </Select>
        </div>
      </section>

      {/* Complete Address */}
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">Complete Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Purok" fullWidth />
          <Input label="Barangay" fullWidth />
          <Input label="Mun/City" fullWidth />
        </div>
      </section>
    </div>
  );
};
