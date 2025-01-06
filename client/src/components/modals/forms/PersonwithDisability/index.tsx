// Import necessary dependencies
import axios from 'axios';
import {
  Checkbox,
  Input,
  Select,
  SelectItem,
  Button,
} from '@nextui-org/react';
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { ClientType } from '../../../../types'; // Adjust the import path as necessary

export const PersonWithDisabilityForm = ({
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
    pwd_number: '',
    nhts_pr_id: '',
    cct_id_number: '',
    phic_id_number: '',
    indigenous_people: false,
    ethnic_group: '',
    civil_status: '',
    height: '',
    weight: '',
    bmi: '',
    educational_attainment: '',
    occupation: '',
    employment_status: '',
    type_of_disability: '',
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
      // Update client ID and any other client-specific data
      setFormValues((prevValues) => ({
        ...prevValues,
        client_id: data.id,
      }));
    }
  }, [data]);

  useEffect(() => {
    if (formValues.height && formValues.weight) {
      const heightInMeters = parseFloat(formValues.height) / 100;
      const weightInKg = parseFloat(formValues.weight);
      if (heightInMeters > 0 && weightInKg > 0) {
        const bmi = (
          weightInKg /
          (heightInMeters * heightInMeters)
        ).toFixed(2);
        setFormValues((prevValues) => ({ ...prevValues, bmi }));
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
          `http://localhost:8081/person_with_disability/${selectedData.id}`,
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
          'http://localhost:8081/person_with_disability',
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
    <div className="p-4 max-w-2xl mx-auto bg-white rounded-lg">
      {/* Registration Details */}
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">Registration Details</h2>
        <section className="mb-6">
          <h2 className="text-xl font-medium mb-2">Client Name</h2>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <Input
              label="COMPLETE ADDRESS"
              fullWidth
              value={data?.address || ''}
              readOnly
            />
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div>
            <label htmlFor="pwd_number" className="block text-sm font-medium">
              PWD Number
            </label>
            <Input
              id="pwd_number"
              type="text"
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
          <Checkbox
            isSelected={isChecked}
            onChange={handleCheckboxChange}
            size="sm"
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
      </section>

      {/* Vital Information */}
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">Vital Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            id="civil_status"
            label="Civil Status"
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
            <SelectItem key="single" value="single">
              Single
            </SelectItem>
            <SelectItem key="married" value="married">
              Married
            </SelectItem>
            <SelectItem key="widowed" value="widowed">
              Widowed
            </SelectItem>
            <SelectItem key="separated" value="separated">
              Separated
            </SelectItem>
            <SelectItem key="divorced" value="divorced">
              Divorced
            </SelectItem>
          </Select>
          <Input
            id="height"
            label="Height (cm)"
            fullWidth
            value={formValues.height}
            onChange={handleInputChange}
          />
          <Input
            id="weight"
            label="Weight (kg)"
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
          <Input
            id="educational_attainment"
            label="Educational Attainment"
            fullWidth
            value={formValues.educational_attainment}
            onChange={handleInputChange}
          />
          <Input
            id="occupation"
            label="Occupation"
            fullWidth
            value={formValues.occupation}
            onChange={handleInputChange}
          />
          <Input
            id="employment_status"
            label="Employment Status"
            fullWidth
            value={formValues.employment_status}
            onChange={handleInputChange}
          />
          <Input
            id="type_of_disability"
            label="Type of Disability"
            fullWidth
            value={formValues.type_of_disability}
            onChange={handleInputChange}
          />
        </div>
      </section>

      <Button
        onClick={handleSubmit}
        color="primary"
        className="mt-4"
      >
        Submit
      </Button>
    </div>
  );
};
