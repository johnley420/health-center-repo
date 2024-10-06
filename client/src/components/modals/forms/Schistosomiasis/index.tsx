import { Checkbox, DatePicker, Input, Select, SelectItem } from '@nextui-org/react';
import React from 'react';

export const SchistosomiasisForm = () => {
  return (
    <div className="p-6">
      <form>
        <div className="space-y-6">
          <div className="flex flex-col space-y-2">
            <label htmlFor="dateOfRegistration" className="font-semibold">Date of Registration</label>
            <Input type="date" id="dateOfRegistration" fullWidth />
          </div>

          <h2 className="text-xl font-bold mt-6">NHTS-PR</h2>
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

          <div className="flex items-center space-x-2 mt-4">
            <label htmlFor="indigenousPeople" className="font-semibold">Indigenous People</label>
            <Checkbox id="indigenousPeople" />
          </div>

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

          <h2 className="text-xl font-bold mt-6">Marital Status</h2>
          <Select placeholder="Select Marital Status" fullWidth>
            <SelectItem key="married">Married</SelectItem>
            <SelectItem key="single">Single</SelectItem>
            <SelectItem key="widow">Widow</SelectItem>
            <SelectItem key="separated">Separated</SelectItem>
            <SelectItem key="live-in">Live-in</SelectItem>
          </Select>

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

          <h2 className="text-xl font-bold mt-6">Mass Drug Administration</h2>
          <div className="flex flex-col space-y-2">
            <label className="font-semibold">Administration Dates</label>
            <div className="flex flex-wrap gap-2">
              <DatePicker label="Date 1" />
              <DatePicker label="Date 2" />
              <DatePicker label="Date 3" />
              <DatePicker label="Date 4" />
              <DatePicker label="Date 5" />
            </div>
          </div>

          <h2 className="text-xl font-bold mt-6">Suspected Schistosomiasis Cases</h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <Input label="Suspected Schisto Cases" fullWidth />
            </div>
            <div className="flex-1">
              <Input label="Suspected Schisto Cases Referred to Health Facility" fullWidth />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
