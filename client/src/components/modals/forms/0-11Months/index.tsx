import { Checkbox, DatePicker, Input, Select, SelectItem, Textarea } from '@nextui-org/react';
import React from 'react';

export const Zeroto11Form = () => {
  return (
    <div className="p-6">
      
      <form>
        {/* Registration Date and PWD Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="registrationDate" className="block mb-1 font-semibold">Date of Registration</label>
            <Input type="date" id="registrationDate" fullWidth />
          </div>
          <div>
            <label htmlFor="pwdNumber" className="block mb-1 font-semibold">PWD Number</label>
            <Input type="text" id="pwdNumber" fullWidth placeholder="Enter PWD Number" />
          </div>
        </div>

        {/* NHTS-PR IDs */}
        <h2 className="text-xl font-semibold mb-4">NHTS-PR</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Input label="NHTS-PR ID NUMBER" fullWidth />
          <Input label="4Ps/CCT ID NUMBER" fullWidth />
          <Input label="PHIC ID NUMBER" fullWidth />
        </div>

        {/* Indigenous People Checkbox */}
        <div className="mb-6">
          <Checkbox id="indigenousPeople">
            <span className="font-semibold">Indigenous People</span>
          </Checkbox>
        </div>

        {/* Child's Name */}
        <h2 className="text-xl font-semibold mb-4">Name of Child</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Input label="Last Name" fullWidth />
          <Input label="First Name" fullWidth />
          <Input label="Middle Name" fullWidth />
        </div>

        <div className="mb-6">
          <Select placeholder="Sex" fullWidth>
            <SelectItem key="male">Male</SelectItem>
            <SelectItem key="female">Female</SelectItem>
          </Select>
        </div>

        {/* Mother's Name */}
        <h2 className="text-xl font-semibold mb-4">Name of Mother</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Input label="Last Name" fullWidth />
          <Input label="First Name" fullWidth />
          <Input label="Middle Name" fullWidth />
        </div>

        {/* Address */}
        <h2 className="text-xl font-semibold mb-4">Complete Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Input label="Purok" fullWidth />
          <Input label="Barangay" fullWidth />
          <Input label="Mun/City" fullWidth />
        </div>

        {/* Birth Weight, Height, and Immunization Dates */}
        <h2 className="text-xl font-semibold mb-4">Newborn Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Input label="Newborn Birth Weight (grams)" fullWidth />
          <Input label="Newborn Birth Height (centimeters)" fullWidth />
          <Input label="Low Birth Weight Infants" fullWidth />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <DatePicker label="Infant Underwent Newborn Screening" fullWidth />
          <DatePicker label="Date of Immunization" fullWidth />
        </div>

        {/* Immunization Dates */}
        <h3 className="text-lg font-semibold mb-4">Date Immunization Received</h3>

        <h4 className="font-semibold mb-2">OPV</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <DatePicker label="1" fullWidth />
          <DatePicker label="2" fullWidth />
          <DatePicker label="3" fullWidth />
        </div>

        <h4 className="font-semibold mb-2">IPV</h4>
        <div className="mb-6">
          <DatePicker label="1" fullWidth />
        </div>

        <h4 className="font-semibold mb-2">Pentavalent</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <DatePicker label="1" fullWidth />
          <DatePicker label="2" fullWidth />
          <DatePicker label="3" fullWidth />
        </div>

        <h4 className="font-semibold mb-2">PCV</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <DatePicker label="1" fullWidth />
          <DatePicker label="2" fullWidth />
          <DatePicker label="3" fullWidth />
        </div>

        <h4 className="font-semibold mb-2">MMR</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <DatePicker label="MMR 1" fullWidth />
          <DatePicker label="MMR 2" fullWidth />
        </div>

        {/* Other Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <DatePicker label="Date Child Reached Age 1" fullWidth />
          <DatePicker label="Date Child Fully Immunized" fullWidth />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <DatePicker label="Date Infant Reaches 6 Months Old" fullWidth />
        </div>

        {/* Breastfeeding Section */}
        <h3 className="text-lg font-semibold mb-4">Date and Age (Months) Infant Seen and Exclusively Breastfed</h3>
        <div className="mb-6">
          <Textarea fullWidth placeholder="Enter details..." />
        </div>

        {/* Remarks Section */}
        <h3 className="text-lg font-semibold mb-4">Remarks</h3>
        <div className="mb-6">
          <Textarea fullWidth placeholder="Enter remarks..." />
        </div>
      </form>
    </div>
  );
};
