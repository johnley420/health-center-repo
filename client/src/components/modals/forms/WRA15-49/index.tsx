import axios from 'axios';
import { Checkbox, Input, Select, SelectItem, Button } from '@nextui-org/react';
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { ClientType } from '../../../../types';
 // Adjust the import path as necessary

export const WRAForm = ({
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
    nhts_pr_id: '',
    cct_id_number: '',
    phic_id_number: '',
    indigenous_people: false,
    ethnic_group: '',
    civil_status: '',
    height: '',
    weight: '',
    bmi: '', // Added BMI field
    no_of_living_children: '',
    educational_attainment: '',
    occupation: '',
    type_of_client: '',
  });

  useEffect(() => {
    if (selectedData) {
      // Update form values with the selected existing data
      setFormValues((prevValues) => ({
        ...prevValues,
        ...selectedData,
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
    const { height, weight } = formValues;
    if (height && weight) {
      const heightInMeters = parseFloat(height) / 100;
      const weightInKg = parseFloat(weight);
      if (heightInMeters > 0 && weightInKg > 0) {
        const bmiValue = (weightInKg / (heightInMeters * heightInMeters)).toFixed(2);
        setFormValues((prevValues) => ({
          ...prevValues,
          bmi: bmiValue,
        }));
      }
    }
  }, [formValues.height, formValues.weight]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
    setFormValues({ ...formValues, indigenous_people: e.target.checked });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormValues({ ...formValues, [id]: value });
  };

  const handleSelectChange = (value: string, id: string) => {
    setFormValues({ ...formValues, [id]: value });
  };

  const handleSubmit = async () => {
    try {
      if (selectedData && selectedData.id) {
        // We're updating existing data
        const response = await axios.put(
          `https://https://health-center-repo-production.up.railway.app/wra/${selectedData.id}`,
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
          'https://https://health-center-repo-production.up.railway.app/wra',
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
    <div>
      {/* NHTS-PR Section */}
      <h2>NHTS-PR</h2>
      <div className="flex flex-wrap gap-4">
        <div className="flex-1">
          <Input
            id="nhts_pr_id"
            label="NHTS-PR ID NUMBER"
            fullWidth
            value={formValues.nhts_pr_id}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex-1">
          <Input
            id="cct_id_number"
            label="4Ps/CCT ID NUMBER"
            fullWidth
            value={formValues.cct_id_number}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex-1">
          <Input
            id="phic_id_number"
            label="PHIC ID NUMBER"
            fullWidth
            value={formValues.phic_id_number}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div>
        <Checkbox
          id="indigenous_people"
          isSelected={isChecked}
          onChange={handleCheckboxChange}
        >
          INDIGENOUS PEOPLE
        </Checkbox>
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

      {/* Client Name */}
      <h2>Client Name</h2>
      <div className="flex flex-wrap gap-4">
        <div className="flex-1">
          <Input
            label="FULL NAME"
            fullWidth
            value={data?.fname || ''}
            readOnly
          />
        </div>
      </div>

      {/* Complete Address */}
      <h2>Complete Address</h2>
      <div className="flex flex-wrap gap-4">
        <div className="flex-1">
          <Input
            label="FULL ADDRESS"
            fullWidth
            value={data?.address || ''}
            readOnly
          />
        </div>
      </div>

      <p>Civil Status</p>
      <Select
        id="civil_status"
        placeholder="Select Civil Status"
        fullWidth
        selectedKeys={
          formValues.civil_status
            ? new Set([formValues.civil_status])
            : new Set()
        }
        onSelectionChange={(selected) => {
          const value = Array.from(selected).join('');
          handleSelectChange(value, 'civil_status');
        }}
      >
        <SelectItem key="married" value="married">
          Married
        </SelectItem>
        <SelectItem key="single" value="single">
          Single
        </SelectItem>
        <SelectItem key="widow" value="widow">
          Widow
        </SelectItem>
        <SelectItem key="separated" value="separated">
          Separated
        </SelectItem>
        <SelectItem key="live-in" value="live-in">
          Live-in
        </SelectItem>
      </Select>

      <h2>Physical Information</h2>
      <div className="flex flex-wrap gap-4">
        <div className="flex-1">
          <Input
            id="height"
            label="Height (cm)"
            fullWidth
            value={formValues.height}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex-1">
          <Input
            id="weight"
            label="Weight (kg)"
            fullWidth
            value={formValues.weight}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex-1">
          <Input
            id="bmi"
            label="BMI"
            fullWidth
            value={formValues.bmi}
            readOnly
          />
        </div>
      </div>

      <h2>Additional Information</h2>
      <div className="flex flex-wrap gap-4">
        <div className="flex-1">
          <Input
            id="no_of_living_children"
            label="No. of Living Children"
            fullWidth
            value={formValues.no_of_living_children}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex-1">
          <Input
            id="educational_attainment"
            label="Educational Attainment"
            fullWidth
            value={formValues.educational_attainment}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex-1">
          <Input
            id="occupation"
            label="Occupation"
            fullWidth
            value={formValues.occupation}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex-1">
          <Input
            id="type_of_client"
            label="Type of Client"
            fullWidth
            value={formValues.type_of_client}
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
