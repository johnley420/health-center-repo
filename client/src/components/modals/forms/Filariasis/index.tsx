import { Checkbox, DatePicker, Input, Select, SelectItem, Textarea } from '@nextui-org/react';
import React from 'react';

export const FilariasisForm = () => {
  return (
    <div className="p-6">
      <div>
        <div className="mb-6">
          <label htmlFor="registrationDate" className="block mb-1 font-semibold">Date of Registration</label>
          <Input type="date" id="registrationDate" fullWidth />
        </div>
        
        <div className="mb-6">
          <label htmlFor="pwdNumber" className="block mb-1 font-semibold">PWD Number</label>
          <Input type="text" id="pwdNumber" fullWidth placeholder="Enter PWD Number" />
        </div>

        <h2 className="text-xl font-semibold mb-2">NHTS-PR</h2>
        <div className="flex flex-wrap gap-4 mb-6">
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

        <div className="mb-6">
          <Checkbox id="indigenousPeople">
            <span className="font-semibold">Indigenous People</span>
          </Checkbox>
        </div>

        <h2 className="text-xl font-semibold mb-2">Client Name</h2>
        <div className="flex flex-wrap gap-4 mb-6">
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

        <div className="mb-6">
          <Select placeholder="Sex" fullWidth>
            <SelectItem key="male">Male</SelectItem>
            <SelectItem key="female">Female</SelectItem>
          </Select>
        </div>

        <h2 className="text-xl font-semibold mb-2">Complete Address</h2>
        <div className="flex flex-wrap gap-4 mb-6">
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

        <h2 className="text-xl font-semibold mb-2">Mass Drug Administrations</h2>
        <div className="flex gap-4 mb-6">
          <DatePicker label="Date Given 1" fullWidth />
          <DatePicker label="Date Given 2" fullWidth />
          <DatePicker label="Date Given 3" fullWidth />
          <DatePicker label="Date Given 4" fullWidth />
        </div>

        <div className="mb-6">
          <Input label="Suspect Filaria Cases" fullWidth />
        </div>
        <div className="mb-6">
          <Input label="Suspect Filaria Cases Referred to Health Facility" fullWidth />
        </div>
        
        <div className="mb-6">
          <label htmlFor="additionalNotes" className="block mb-1 font-semibold">Additional Notes</label>
          <Textarea id="additionalNotes" placeholder="Enter any additional information..." fullWidth />
        </div>
      </div>
    </div>
  );
};
