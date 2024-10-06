import { Checkbox, DatePicker, Input, Select, SelectItem, Textarea } from '@nextui-org/react';
import React from 'react';

export const TentoNineteenForm = () => {
  return (
    <div className="p-4 max-w-2xl bg-white ">

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

      {/* Height and Weight */}
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">Health Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          <Input label="Height" fullWidth />
          <Input label="Weight" fullWidth />
        </div>
        <Input label='Educational Status' fullWidth />
      </section>

      {/* Age and Dates Given */}
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">Age Details</h2>
        {[10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map((age) => (
          <div key={age} className="mb-4">
            <p>{age} years old</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker label='Date Given' fullWidth />
              <DatePicker label='Date Given' fullWidth />
            </div>
          </div>
        ))}
      </section>

      {/* Immunization Services */}
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">Immunization Services</h2>
        <p>HPV</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker label='1st Dose' fullWidth />
          <DatePicker label='2nd Dose' fullWidth />
        </div>
        <p className='my-4'>School-based Immunization (GRADE 7)</p>
        <div className="mb-4 flex flex-col gap-2">
          <DatePicker label='Date Given' fullWidth />
          <DatePicker label='Date Given' fullWidth />
        </div>
      </section>

      {/* Additional Comments */}
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">Additional Comments</h2>
        <Textarea placeholder="Any additional information..." fullWidth />
      </section>
    </div>
  );
};
