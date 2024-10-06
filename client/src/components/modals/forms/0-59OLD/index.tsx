import { Checkbox, CheckboxGroup, DatePicker, Input, Select, SelectItem, Textarea } from "@nextui-org/react";
import React from 'react';

export const ZEROTO59MONTHFORM = () => {
  return (
    <div className="p-6">
      <form>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="dateOfRegistration" className="font-semibold">Date of Registration</label>
            <Input type="date" id="dateOfRegistration" fullWidth />
          </div>
          <div className="flex flex-col space-y-2">
            <label htmlFor="pwdNumber" className="font-semibold">PWD Number</label>
            <Input type="text" id="pwdNumber" fullWidth />
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

          <div className="flex items-center space-x-2 my-4">
            <label htmlFor="indigenousPeople" className="font-semibold">INDIGENOUS PEOPLE</label>
            <Checkbox id="indigenousPeople" />
          </div>

          <h2 className="text-xl font-bold my-6">Client Name</h2>
          <div className="flex flex-wrap gap-4 mb-2">
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

          <div className="mt-4" >
          <Select placeholder="Select Sex" fullWidth >
            <SelectItem key="Male">Male</SelectItem>
            <SelectItem key="Female">Female</SelectItem>
          </Select>
          </div>

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

          <h2 className="text-xl font-bold mt-6">Screening Results</h2>
          <p className="font-semibold mt-2">Date of Client Visit</p>
          <div className="flex flex-wrap gap-4">
            <DatePicker label='1st Visit' className="flex-1" />
            <DatePicker label='2nd Visit' className="flex-1" />
            <DatePicker label='3rd Visit' className="flex-1" />
          </div>

          <Select placeholder="Select Vision Test" fullWidth className="mt-4">
            <SelectItem key='visualAcuity'>Visual Acuity</SelectItem>
            <SelectItem key='pinholeVision'>Pinhole Vision</SelectItem>
          </Select>

          <h2 className="text-xl font-bold mt-6">Management</h2>
          <CheckboxGroup
            label="Select Referral Options"
            defaultValue={["Referred Immediately"]}
            className="space-y-2 mt-2"
          >
            <Checkbox value="Referred Immediately">Referred Immediately</Checkbox>
            <Checkbox value="Referred to Optometrist">Referred to Optometrist</Checkbox>
            <Checkbox value="Referred to Ophthalmologist">Referred to Ophthalmologist</Checkbox>
          </CheckboxGroup>

          <div className="flex flex-col space-y-2 mt-4">
            <Textarea label='Remarks' fullWidth />
          </div>
        </div>
      </form>
    </div>
  );
};
