// FilariasisForm.tsx

import axios from 'axios';
import {
  Checkbox,
  DatePicker,
  Input,
  Button,
  Textarea,
  DateValue,
} from '@nextui-org/react';
import React, { useState, useEffect } from 'react';
import { parseDate } from '@internationalized/date';

export const FilariasisForm = ({
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
    suspect_filaria_cases: string;
    suspect_filaria_cases_referred: string;
    mass_drug_administrations: {
      date_given1: DateValue | null;
      date_given2: DateValue | null;
      date_given3: DateValue | null;
      date_given4: DateValue | null;
    };
    additional_notes: string;
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
    suspect_filaria_cases: selectedData?.suspect_filaria_cases || '',
    suspect_filaria_cases_referred: selectedData?.suspect_filaria_cases_referred || '',
    mass_drug_administrations: {
      date_given1: null,
      date_given2: null,
      date_given3: null,
      date_given4: null,
    },
    additional_notes: selectedData?.additional_notes || '',
  });

  useEffect(() => {
    if (selectedData) {
      // Parse mass_drug_administrations data
      const mdaData = selectedData.mass_drug_administrations
        ? JSON.parse(selectedData.mass_drug_administrations)
        : formValues.mass_drug_administrations;

      const parsedMDA = {
        date_given1: mdaData.date_given1 ? parseDate(mdaData.date_given1) : null,
        date_given2: mdaData.date_given2 ? parseDate(mdaData.date_given2) : null,
        date_given3: mdaData.date_given3 ? parseDate(mdaData.date_given3) : null,
        date_given4: mdaData.date_given4 ? parseDate(mdaData.date_given4) : null,
      };

      // Update form values with selected data
      setFormValues((prevValues) => ({
        ...prevValues,
        ...selectedData,
        mass_drug_administrations: parsedMDA,
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
    setFormValues({ ...formValues, indigenous_people: e.target.checked });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormValues({ ...formValues, [id]: value });
  };

  const handleMDAChange = (field: string, value: DateValue | null) => {
    setFormValues({
      ...formValues,
      mass_drug_administrations: {
        ...formValues.mass_drug_administrations,
        [field]: value,
      },
    });
  };

  const handleSubmit = async () => {
    try {
      // Prepare data for submission
      const transformedFormValues = {
        ...formValues,
        mass_drug_administrations: {
          date_given1: formValues.mass_drug_administrations.date_given1
            ? formValues.mass_drug_administrations.date_given1.toString()
            : null,
          date_given2: formValues.mass_drug_administrations.date_given2
            ? formValues.mass_drug_administrations.date_given2.toString()
            : null,
          date_given3: formValues.mass_drug_administrations.date_given3
            ? formValues.mass_drug_administrations.date_given3.toString()
            : null,
          date_given4: formValues.mass_drug_administrations.date_given4
            ? formValues.mass_drug_administrations.date_given4.toString()
            : null,
        },
      };

      if (selectedData && selectedData.id) {
        // Update existing data
        const response = await axios.put(
          `https://health-center-repo-production.up.railway.app/filariasis/${selectedData.id}`,
          transformedFormValues
        );
        alert('Data updated successfully!');
        console.log('Data updated successfully:', response.data);
      } else {
        // Create new data
        const response = await axios.post(
          'https://health-center-repo-production.up.railway.app/filariasis',
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
      <div>
        {/* PWD Number */}
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
            <span className="font-semibold">Indigenous People</span>
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

        <h2 className="text-xl font-semibold mb-2">Mass Drug Administrations</h2>
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="flex-1">
            <DatePicker
              label="Date Given 1"
              fullWidth
              value={formValues.mass_drug_administrations.date_given1}
              onChange={(value) => handleMDAChange('date_given1', value)}
            />
          </div>
          <div className="flex-1">
            <DatePicker
              label="Date Given 2"
              fullWidth
              value={formValues.mass_drug_administrations.date_given2}
              onChange={(value) => handleMDAChange('date_given2', value)}
            />
          </div>
          <div className="flex-1">
            <DatePicker
              label="Date Given 3"
              fullWidth
              value={formValues.mass_drug_administrations.date_given3}
              onChange={(value) => handleMDAChange('date_given3', value)}
            />
          </div>
          <div className="flex-1">
            <DatePicker
              label="Date Given 4"
              fullWidth
              value={formValues.mass_drug_administrations.date_given4}
              onChange={(value) => handleMDAChange('date_given4', value)}
            />
          </div>
        </div>

        <div className="mb-6">
          <Input
            label="Suspect Filaria Cases"
            id="suspect_filaria_cases"
            fullWidth
            value={formValues.suspect_filaria_cases}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-6">
          <Input
            label="Suspect Filaria Cases Referred to Health Facility"
            id="suspect_filaria_cases_referred"
            fullWidth
            value={formValues.suspect_filaria_cases_referred}
            onChange={handleInputChange}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="additional_notes" className="block mb-1 font-semibold">
            Additional Notes
          </label>
          <Textarea
            id="additional_notes"
            placeholder="Enter any additional information..."
            fullWidth
            value={formValues.additional_notes}
            onChange={handleInputChange}
          />
        </div>

        <Button onClick={handleSubmit} color="primary" className="mt-4">
          Submit
        </Button>
      </div>
    </div>
  );
};
