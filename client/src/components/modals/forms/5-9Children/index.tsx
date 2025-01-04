// FIVETO9CHILDRENFORM.tsx

import axios from 'axios';
import {
  Checkbox,
  Input,
  Button,
} from '@nextui-org/react';
import React, { useState, useEffect } from 'react';

export const FIVETO9CHILDRENFORM = ({
  data,
  selectedData,
}: {
  data: any; // ClientType | null
  selectedData: any;
}) => {
  // Define types
  type FormValuesType = {
    worker_id: string;
    client_id: number | '';
    pwd_number: string;
    nhts_pr_id: string;
    cct_id_number: string;
    phic_id_number: string;
    indigenous_people: boolean;
    ethnic_group: string;
    height: string;
    weight: string;
    bmi: string;
    educational_status: string;
  };

  const [isChecked, setIsChecked] = useState<boolean>(
    selectedData?.indigenous_people || false
  );

  const [formValues, setFormValues] = useState<FormValuesType>({
    worker_id: sessionStorage.getItem('id') || '',
    client_id: data?.id || '',
    pwd_number: selectedData?.pwd_number || '',
    nhts_pr_id: selectedData?.nhts_pr_id || '',
    cct_id_number: selectedData?.cct_id_number || '',
    phic_id_number: selectedData?.phic_id_number || '',
    indigenous_people: selectedData?.indigenous_people || false,
    ethnic_group: selectedData?.ethnic_group || '',
    height: selectedData?.height || '',
    weight: selectedData?.weight || '',
    bmi: selectedData?.bmi || '',
    educational_status: selectedData?.educational_status || '',
  });

  useEffect(() => {
    if (selectedData) {
      // Update form values with selected data
      setFormValues((prevValues) => ({
        ...prevValues,
        ...selectedData,
      }));
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

  // Function to calculate BMI
  const calculateBMI = (height: string, weight: string) => {
    const heightInMeters = parseFloat(height) / 100; // Convert cm to meters
    const weightInKg = parseFloat(weight);

    if (heightInMeters > 0 && weightInKg > 0) {
      const bmiValue = weightInKg / (heightInMeters * heightInMeters);
      return bmiValue.toFixed(2); // Round to 2 decimal places
    } else {
      return '';
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
    setFormValues({ ...formValues, indigenous_people: e.target.checked });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    let updatedValues = { ...formValues, [id]: value };

    if (id === 'height' || id === 'weight') {
      const bmi = calculateBMI(
        id === 'height' ? value : formValues.height,
        id === 'weight' ? value : formValues.weight
      );
      updatedValues = { ...updatedValues, bmi };
    }

    setFormValues(updatedValues);
  };

  const handleSubmit = async () => {
    try {
      // Prepare data for submission
      const transformedFormValues = {
        ...formValues,
      };

      if (selectedData && selectedData.id) {
        // Update existing data
        const response = await axios.put(
          `https://https://health-center-repo-production.up.railway.app/5-9yearsold/${selectedData.id}`,
          transformedFormValues
        );
        alert('Data updated successfully!');
        console.log('Data updated successfully:', response.data);
      } else {
        // Create new data
        const response = await axios.post(
          'https://https://health-center-repo-production.up.railway.app/5-9yearsold',
          transformedFormValues
        );
        alert('Data submitted successfully!');
        console.log('Data submitted successfully:', response.data);
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('An error occurred while submitting data.');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <label htmlFor="pwd_number" className="block mb-1 font-semibold">
          PWD Number
        </label>
        <Input
          type="text"
          id="pwd_number"
          fullWidth
          placeholder="Enter PWD Number"
          value={formValues.pwd_number}
          onChange={handleInputChange}
        />
      </div>

      <h2 className="text-xl font-semibold mb-2">NHTS-PR</h2>
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1">
          <Input
            label="NHTS-PR ID NUMBER"
            id="nhts_pr_id"
            fullWidth
            value={formValues.nhts_pr_id}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex-1">
          <Input
            label="4Ps/CCT ID NUMBER"
            id="cct_id_number"
            fullWidth
            value={formValues.cct_id_number}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex-1">
          <Input
            label="PHIC ID NUMBER"
            id="phic_id_number"
            fullWidth
            value={formValues.phic_id_number}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="mb-6">
        <Checkbox
          id="indigenous_people"
          isSelected={isChecked}
          onChange={handleCheckboxChange}
        >
          <span className="font-semibold">INDIGENOUS PEOPLE</span>
        </Checkbox>
      </div>
      {isChecked && (
        <div className="mb-6">
          <Input
            label="Ethnic Group"
            id="ethnic_group"
            fullWidth
            value={formValues.ethnic_group}
            onChange={handleInputChange}
          />
        </div>
      )}

      <h2 className="text-xl font-semibold mb-2">Client Name</h2>
      <div className="mb-6">
        <Input label="Full Name" fullWidth value={data?.fname || ''} readOnly />
      </div>

      <h2 className="text-xl font-semibold mb-2">Complete Address</h2>
      <div className="mb-6">
        <Input label="Address" fullWidth value={data?.address || ''} readOnly />
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1">
          <Input
            label="Height (cm)"
            id="height"
            fullWidth
            type="number"
            value={formValues.height}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex-1">
          <Input
            label="Weight (kg)"
            id="weight"
            fullWidth
            type="number"
            value={formValues.weight}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex-1">
          <Input
            label="BMI"
            id="bmi"
            fullWidth
            value={formValues.bmi}
            readOnly
          />
        </div>
        <div className="flex-1">
          <Input
            label="Educational Status"
            id="educational_status"
            fullWidth
            value={formValues.educational_status}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <Button onClick={handleSubmit} color="primary" className="mt-4">
        Submit
      </Button>
    </div>
  );
};
