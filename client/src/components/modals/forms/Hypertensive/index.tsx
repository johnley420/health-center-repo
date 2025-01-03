// HypertensiveForm.tsx

import axios from 'axios';
import { Checkbox, Input, Button } from '@nextui-org/react';
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2'; // Adjust the import path as necessary
import { ClientType } from '../../../../types';

export const HypertensiveForm = ({
  data,
  selectedData,
}: {
  data: ClientType | null;
  selectedData: any;
}) => {
  const [isChecked, setIsChecked] = useState<boolean>(
    selectedData?.indigenous_people || false
  );

  const [formValues, setFormValues] = useState({
    worker_id: sessionStorage.getItem('id') || '',
    client_id: data?.id || '',
    pwd_number: selectedData?.pwd_number || '',
    nhts_pr_id: selectedData?.nhts_pr_id || '',
    cct_id_number: selectedData?.cct_id_number || '',
    phic_id_number: selectedData?.phic_id_number || '',
    indigenous_people: selectedData?.indigenous_people || false,
    ethnic_group: selectedData?.ethnic_group || '',
    civil_status: selectedData?.civil_status || '',
    height: selectedData?.height?.toString() || '',
    weight: selectedData?.weight?.toString() || '',
    bmi: selectedData?.bmi?.toString() || '',
  });

  useEffect(() => {
    if (selectedData) {
      console.log('Selected Data:', selectedData);
      // Update form values with the selected existing data
      setFormValues((prevValues) => ({
        ...prevValues,
        ...selectedData,
        height: selectedData.height?.toString() || '',
        weight: selectedData.weight?.toString() || '',
        bmi: selectedData.bmi?.toString() || '',
      }));
      // Update the indigenous people checkbox
      setIsChecked(selectedData.indigenous_people);
    }
  }, [selectedData]);

  useEffect(() => {
    if (data) {
      // Update client ID
      setFormValues((prevValues) => ({
        ...prevValues,
        client_id: data.id,
      }));
    }
  }, [data]);

  // Automatically calculate BMI when height or weight changes
  useEffect(() => {
    if (formValues.height && formValues.weight) {
      const heightInMeters = parseFloat(formValues.height) / 100;
      const weightInKg = parseFloat(formValues.weight);

      if (heightInMeters > 0 && weightInKg > 0) {
        const bmiValue = (weightInKg / (heightInMeters * heightInMeters)).toFixed(2);
        setFormValues((prevValues) => ({
          ...prevValues,
          bmi: bmiValue,
        }));
      } else {
        setFormValues((prevValues) => ({
          ...prevValues,
          bmi: '',
        }));
      }
    }
  }, [formValues.height, formValues.weight]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
    setFormValues({ ...formValues, indigenous_people: e.target.checked });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormValues({
      ...formValues,
      [id]: value,
    });
  };

  const handleSubmit = async () => {
    try {
      if (selectedData && selectedData.id) {
        // We're updating existing data
        const response = await axios.put(
          `health-center-repo-production.up.railway.app/hypertensive/${selectedData.id}`,
          formValues
        );
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Data updated successfully!',
        });
        console.log('Data updated successfully:', response.data);
      } else {
        // We're creating new data
        const response = await axios.post(
          'health-center-repo-production.up.railway.app/hypertensive',
          formValues
        );
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Data submitted successfully!',
        });
        console.log('Data submitted successfully:', response.data);
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while submitting data.',
      });
    }
  };

  return (
    <div className="p-4 max-w-2xl bg-white rounded-lg">
      {/* Registration Details */}
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">Registration Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pwd_number" className="block text-sm font-medium">
              PWD Number
            </label>
            <Input
              type="text"
              id="pwd_number"
              fullWidth
              value={formValues.pwd_number}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </section>

      {/* NHTS-PR Information */}
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">NHTS-PR</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            id="nhts_pr_id"
            label="NHTS-PR ID NUMBER"
            fullWidth
            value={formValues.nhts_pr_id}
            onChange={handleInputChange}
          />
          <Input
            id="cct_id_number"
            label="4Ps/CCT ID NUMBER"
            fullWidth
            value={formValues.cct_id_number}
            onChange={handleInputChange}
          />
          <Input
            id="phic_id_number"
            label="PHIC ID NUMBER"
            fullWidth
            value={formValues.phic_id_number}
            onChange={handleInputChange}
          />
        </div>
        <div className="mt-4">
          <label htmlFor="indigenous_people" className="flex items-center">
            <Checkbox
              id="indigenous_people"
              isSelected={isChecked}
              onChange={handleCheckboxChange}
            />
            <span className="ml-2 text-sm">INDIGENOUS PEOPLE</span>
          </label>
          {isChecked && (
            <div className="mt-2">
              <Input
                id="ethnic_group"
                label="Please identify your ethnic group"
                placeholder="Enter ethnic group"
                fullWidth
                size="md"
                value={formValues.ethnic_group}
                onChange={handleInputChange}
              />
            </div>
          )}
        </div>
      </section>

      {/* Client Name */}
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">Client Name</h2>
        <div>
          <Input
            label="FULL NAME"
            fullWidth
            value={data?.fname || ''}
            readOnly
          />
        </div>
      </section>

      {/* Complete Address */}
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">Complete Address</h2>
        <div>
          <Input
            label="FULL ADDRESS"
            fullWidth
            value={data?.address || ''}
            readOnly
          />
        </div>
      </section>

      {/* Physical Information */}
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">Physical Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            id="height"
            label="Height (cm)"
            type="number"
            step="0.1"
            fullWidth
            value={formValues.height}
            onChange={handleInputChange}
          />
          <Input
            id="weight"
            label="Weight (kg)"
            type="number"
            step="0.1"
            fullWidth
            value={formValues.weight}
            onChange={handleInputChange}
          />
          <Input
            id="bmi"
            label="BMI"
            fullWidth
            value={formValues.bmi}
            readOnly
          />
        </div>
      </section>

      <Button onClick={handleSubmit} color="primary" className="mt-4">
        Submit
      </Button>
    </div>
  );
};
