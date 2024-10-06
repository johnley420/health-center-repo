import { Checkbox, DatePicker, Input, Select, SelectItem, Switch, Textarea } from '@nextui-org/react';
import React from 'react';

export const PrenatalForm = () => {
  return (
    <div className="p-6 bg-white rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Prenatal Form</h1>

      {/* Date of Registration and PWD Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="dateOfRegistration" className="block text-sm font-medium text-gray-700">
            Date of Registration
          </label>
          <Input type="date" id="dateOfRegistration" fullWidth />
        </div>
        <div>
          <label htmlFor="pwdNumber" className="block text-sm font-medium text-gray-700">
            PWD Number
          </label>
          <Input type="text" id="pwdNumber" fullWidth />
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-2">NHTS-PR</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Input label="NHTS-PR ID NUMBER" fullWidth />
        <Input label="4Ps/CCT ID NUMBER" fullWidth />
        <Input label="PHIC ID NUMBER" fullWidth />
      </div>

      <div className="mb-4 flex gap-2">
        <p>Indigenous People</p>
        <Checkbox id="indigenousPeople" />
      </div>

      <h2 className="text-lg font-semibold mb-2">Client Name</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Input label="LAST NAME" fullWidth />
        <Input label="FIRST NAME" fullWidth />
        <Input label="MIDDLE NAME" fullWidth />
      </div>

      <h2 className="text-lg font-semibold mb-2">Complete Address</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Input label="Purok" fullWidth />
        <Input label="Barangay" fullWidth />
        <Input label="Mun/City" fullWidth />
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <DatePicker label="Date of Birth" fullWidth />
        <Input label="Age" type="number" fullWidth />
        <Input label="Height (cm)" type="number" fullWidth />
        <Input label="Weight (kg)" type="number" fullWidth />
        <Input label="BMI" type="number" fullWidth />
      </div>

      {/* LMP Data */}
      <p className="mb-2">LMP/G(Gravida) P(Parity) A(Abortion) S(Stillbirth)</p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Input type='number' label="G(Gravida)" fullWidth />
        <Input type='number' label="P(Parity)" fullWidth />
        <Input type='number' label="A(Abortion)" fullWidth />
        <Input type='number' label="S(Stillbirth)" fullWidth />
      </div>

      <div className="mb-6">
        <DatePicker label="Expected Date of Confinement" fullWidth />
      </div>

      {/* Actual Dates of Prenatal Visits */}
      <h2 className="text-lg font-semibold mb-2">Actual Dates of Prenatal Visits</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <DatePicker label="Visit 1" fullWidth />
        <DatePicker label="Visit 2" fullWidth />
        <DatePicker label="Visit 3" fullWidth />
        <DatePicker label="Visit 4" fullWidth />
      </div>

      {/* Next Prenatal Visits */}
      <h2 className="text-lg font-semibold mb-2">Next Prenatal Visits</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <DatePicker label="Next Visit 1" fullWidth />
        <DatePicker label="Next Visit 2" fullWidth />
        <DatePicker label="Next Visit 3" fullWidth />
        <DatePicker label="Next Visit 4" fullWidth />
      </div>

      <Input label="Risk Codes" fullWidth className="mb-4" />

      <div className="mb-4">
        <Select label='Seen by'>
          <SelectItem key='doctor' value='Doctor'>Doctor</SelectItem>
          <SelectItem key='dentist' value='Dentist'>Dentist</SelectItem>
        </Select>
      </div>

      <div className="flex items-center mb-4">
        <label className="mr-2">With Birth Plan</label>
        <Switch />
      </div>

      {/* Td Immunizations */}
      <h2 className="text-lg font-semibold mb-2">Td Immunizations Dose</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <DatePicker label="Previous" fullWidth />
        <DatePicker label="Current" fullWidth />
      </div>

      <Input label="Laboratory Examinations" fullWidth className="mb-4" />
      <Input label="Micronutrient Supplementation/Deworming" fullWidth className="mb-4" />
      <Input label="Quality Prenatal Care" fullWidth className="mb-4" />

      <div className="mb-4">
        <DatePicker label="Date of Delivery" fullWidth />
      </div>

      <Input label="Place of Delivery" fullWidth className="mb-4" />
      <Input label="Type of Delivery" fullWidth className="mb-4" />
      <Input label="Outcome of Delivery" fullWidth className="mb-4" />
      <DatePicker label="Initiated Breast Feeding" fullWidth className="mb-4" />

      <h2 className="text-lg font-semibold mb-2">Dates of Postpartum Care/Clinic Visits</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <DatePicker label="1st PP" fullWidth />
        <DatePicker label="2nd PP" fullWidth />
      </div>

      <Input label="Micronutrient Supplementation" fullWidth className="mb-4" />
      <Input label="Family Planning" fullWidth className="mb-4" />
      <Textarea label="Remarks" fullWidth className="mb-4" />
    </div>
  );
};
