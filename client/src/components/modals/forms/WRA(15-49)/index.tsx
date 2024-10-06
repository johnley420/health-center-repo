import { Checkbox, Input, Select, SelectItem } from '@nextui-org/react';
import React from 'react';

export const WRAForm = () => {
  return (
    <div>
      <div>
        <div>
          <label htmlFor="dateOfRegistration">Date of Registration</label>
          <Input type="date" id="dateOfRegistration" fullWidth />
        </div>

        <h2>NHTS-PR</h2>
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

        <div>
          <label htmlFor="indigenousPeople">INDIGENOUS PEOPLE</label>
          <Checkbox id="indigenousPeople" />
        </div>

        <h2>Client Name</h2>
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

        <p>If Married, write Husband's name</p>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <Input label="LAST NAME (Husband)" fullWidth />
          </div>
          <div className="flex-1">
            <Input label="FIRST NAME (Husband)" fullWidth />
          </div>
        </div>

        <h2>Complete Address</h2>
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

        <p>Civil Status</p>
        <Select placeholder="Select Civil Status" fullWidth>
          <SelectItem key="married">Married</SelectItem>
          <SelectItem key="single">Single</SelectItem>
          <SelectItem key="widow">Widow</SelectItem>
          <SelectItem key="separated">Separated</SelectItem>
          <SelectItem key="live-in">Live-in</SelectItem>
        </Select>

        <h2>Physical Information</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <Input label="Height (meters)" fullWidth />
          </div>
          <div className="flex-1">
            <Input label="Weight (kg)" fullWidth />
          </div>
        </div>

        <h2>Additional Information</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <Input label="No. of Living Children" fullWidth />
          </div>
          <div className="flex-1">
            <Input label="Educational Attainment" fullWidth />
          </div>
          <div className="flex-1">
            <Input label="Occupation" fullWidth />
          </div>
          <div className="flex-1">
            <Input label="Type of Client" fullWidth />
          </div>
        </div>
      </div>
    </div>
  );
};
