import { Checkbox, Input, Select, SelectItem } from '@nextui-org/react';
import React from 'react';

export const FIVETO9CHILDRENFORM = () => {
  return (
    <div className="p-6">

      <div className="mb-6">
        <label htmlFor="dateOfRegistration" className="block mb-1 font-semibold">Date of Registration</label>
        <Input type="date" id="dateOfRegistration" fullWidth />
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
          <span className="font-semibold">INDIGENOUS PEOPLE</span>
        </Checkbox>
      </div>

      <h2 className="text-xl font-semibold mb-2">Client Name</h2>
      <div className="flex flex-wrap gap-4 mb-6">
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

      <div className="mb-6">
        <Select placeholder="Sex" fullWidth>
          <SelectItem key="Male">Male</SelectItem>
          <SelectItem key="Female">Female</SelectItem>
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
      <div className='flex flex-wrap gap-4'>
      <Input label="Height" fullWidth />
      <Input label="Weight" fullWidth />
      <Input label='Educational Status' fullWidth />
      </div>
    </div>
  );
};
