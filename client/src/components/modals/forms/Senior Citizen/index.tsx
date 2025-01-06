// SeniorCitizenForm.tsx

import axios from 'axios';
import {
  Checkbox,
  DatePicker,
  Input,
  Button,
  DateValue,
} from "@nextui-org/react";
import React, { useState, useEffect } from 'react';
import { parseDate } from '@internationalized/date';

export const SeniorCitizenForm = ({
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
    osca_id_number: string;
    pneumococcal_vaccine: {
      first_dose: DateValue | null;
      second_dose: DateValue | null;
    };
    influenza_vaccine: {
      first_dose: DateValue | null;
      second_dose: DateValue | null;
      third_dose: DateValue | null;
      fourth_dose: DateValue | null;
      fifth_dose: DateValue | null;
    };
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
    osca_id_number: selectedData?.osca_id_number || '',
    pneumococcal_vaccine: { first_dose: null, second_dose: null },
    influenza_vaccine: {
      first_dose: null,
      second_dose: null,
      third_dose: null,
      fourth_dose: null,
      fifth_dose: null,
    },
  });

  useEffect(() => {
    if (selectedData) {
      // Parse pneumococcal_vaccine data
      const pneumococcalVaccineData = selectedData.pneumococcal_vaccine
        ? JSON.parse(selectedData.pneumococcal_vaccine)
        : formValues.pneumococcal_vaccine;

      const parsedPneumococcalVaccine = {
        first_dose: pneumococcalVaccineData.first_dose
          ? parseDate(pneumococcalVaccineData.first_dose)
          : null,
        second_dose: pneumococcalVaccineData.second_dose
          ? parseDate(pneumococcalVaccineData.second_dose)
          : null,
      };

      // Parse influenza_vaccine data
      const influenzaVaccineData = selectedData.influenza_vaccine
        ? JSON.parse(selectedData.influenza_vaccine)
        : formValues.influenza_vaccine;

      const parsedInfluenzaVaccine = {
        first_dose: influenzaVaccineData.first_dose
          ? parseDate(influenzaVaccineData.first_dose)
          : null,
        second_dose: influenzaVaccineData.second_dose
          ? parseDate(influenzaVaccineData.second_dose)
          : null,
        third_dose: influenzaVaccineData.third_dose
          ? parseDate(influenzaVaccineData.third_dose)
          : null,
        fourth_dose: influenzaVaccineData.fourth_dose
          ? parseDate(influenzaVaccineData.fourth_dose)
          : null,
        fifth_dose: influenzaVaccineData.fifth_dose
          ? parseDate(influenzaVaccineData.fifth_dose)
          : null,
      };

      // Update form values with selected data
      setFormValues((prevValues) => ({
        ...prevValues,
        ...selectedData,
        pneumococcal_vaccine: parsedPneumococcalVaccine,
        influenza_vaccine: parsedInfluenzaVaccine,
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

  const handleNestedDateChange = (
    category: 'pneumococcal_vaccine' | 'influenza_vaccine',
    field: string,
    value: DateValue | null
  ) => {
    setFormValues({
      ...formValues,
      [category]: {
        ...formValues[category],
        [field]: value,
      },
    });
  };

  const handleSubmit = async () => {
    try {
      // Prepare data for submission
      const transformedFormValues = {
        ...formValues,
        pneumococcal_vaccine: {
          first_dose: formValues.pneumococcal_vaccine.first_dose
            ? formValues.pneumococcal_vaccine.first_dose.toString()
            : null,
          second_dose: formValues.pneumococcal_vaccine.second_dose
            ? formValues.pneumococcal_vaccine.second_dose.toString()
            : null,
        },
        influenza_vaccine: {
          first_dose: formValues.influenza_vaccine.first_dose
            ? formValues.influenza_vaccine.first_dose.toString()
            : null,
          second_dose: formValues.influenza_vaccine.second_dose
            ? formValues.influenza_vaccine.second_dose.toString()
            : null,
          third_dose: formValues.influenza_vaccine.third_dose
            ? formValues.influenza_vaccine.third_dose.toString()
            : null,
          fourth_dose: formValues.influenza_vaccine.fourth_dose
            ? formValues.influenza_vaccine.fourth_dose.toString()
            : null,
          fifth_dose: formValues.influenza_vaccine.fifth_dose
            ? formValues.influenza_vaccine.fifth_dose.toString()
            : null,
        },
      };

      if (selectedData && selectedData.id) {
        // Update existing data
        const response = await axios.put(
          `http://localhost:8081/senior-citizen/${selectedData.id}`,
          transformedFormValues
        );
        alert('Data updated successfully!');
        console.log('Data updated successfully:', response.data);
      } else {
        // Create new data
        const response = await axios.post(
          'http://localhost:8081/senior-citizen',
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
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Senior Citizen Form</h1>

      {/* PWD Number */}
      <div className="mb-4">
        <Input
          label="PWD Number"
          id="pwd_number"
          fullWidth
          value={formValues.pwd_number}
          onChange={handleInputChange}
        />
      </div>

      <h2 className="text-xl font-semibold mt-6">NHTS-PR</h2>
      <div className="flex flex-wrap gap-4 mb-4">
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

      {/* Indigenous People Checkbox */}
      <div className="mb-4">
        <label htmlFor="indigenous_people" className="flex items-center">
          <Checkbox
            id="indigenous_people"
            isSelected={isChecked}
            onChange={handleCheckboxChange}
            className="mr-2"
          />
          Indigenous People
        </label>
      </div>
      {isChecked && (
        <div className="mb-4">
          <Input
            label="Ethnic Group"
            id="ethnic_group"
            fullWidth
            value={formValues.ethnic_group}
            onChange={handleInputChange}
          />
        </div>
      )}

      {/* Client Name */}
      <h2 className="text-xl font-semibold mt-6">Client Name</h2>
      <div className="mb-4">
        <Input label="Full Name" fullWidth value={data?.fname || ''} readOnly />
      </div>

      {/* Complete Address */}
      <h2 className="text-xl font-semibold mt-6">Complete Address</h2>
      <div className="mb-4">
        <Input label="Address" fullWidth value={data?.address || ''} readOnly />
      </div>

      {/* OSCA ID Number */}
      <div className="mb-4">
        <Input
          label="OSCA ID NUMBER"
          id="osca_id_number"
          fullWidth
          value={formValues.osca_id_number}
          onChange={handleInputChange}
        />
      </div>

      {/* Pneumococcal Vaccine */}
      <h2 className="text-xl font-semibold mt-6">Pneumococcal Vaccine</h2>
      <div className="flex gap-4 flex-wrap mb-4">
        <div className="flex-1">
          <DatePicker
            label="1st Dose"
            fullWidth
            value={formValues.pneumococcal_vaccine.first_dose}
            onChange={(value) =>
              handleNestedDateChange('pneumococcal_vaccine', 'first_dose', value)
            }
          />
        </div>
        <div className="flex-1">
          <DatePicker
            label="2nd Dose"
            fullWidth
            value={formValues.pneumococcal_vaccine.second_dose}
            onChange={(value) =>
              handleNestedDateChange('pneumococcal_vaccine', 'second_dose', value)
            }
          />
        </div>
      </div>

      {/* Influenza Vaccine */}
      <h2 className="text-xl font-semibold mt-6">Influenza Vaccine</h2>
      <div className="flex gap-4 flex-wrap mb-4">
        <div className="flex-1">
          <DatePicker
            label="1st Dose"
            fullWidth
            value={formValues.influenza_vaccine.first_dose}
            onChange={(value) =>
              handleNestedDateChange('influenza_vaccine', 'first_dose', value)
            }
          />
        </div>
        <div className="flex-1">
          <DatePicker
            label="2nd Dose"
            fullWidth
            value={formValues.influenza_vaccine.second_dose}
            onChange={(value) =>
              handleNestedDateChange('influenza_vaccine', 'second_dose', value)
            }
          />
        </div>
        <div className="flex-1">
          <DatePicker
            label="3rd Dose"
            fullWidth
            value={formValues.influenza_vaccine.third_dose}
            onChange={(value) =>
              handleNestedDateChange('influenza_vaccine', 'third_dose', value)
            }
          />
        </div>
        <div className="flex-1">
          <DatePicker
            label="4th Dose"
            fullWidth
            value={formValues.influenza_vaccine.fourth_dose}
            onChange={(value) =>
              handleNestedDateChange('influenza_vaccine', 'fourth_dose', value)
            }
          />
        </div>
        <div className="flex-1">
          <DatePicker
            label="5th Dose"
            fullWidth
            value={formValues.influenza_vaccine.fifth_dose}
            onChange={(value) =>
              handleNestedDateChange('influenza_vaccine', 'fifth_dose', value)
            }
          />
        </div>
      </div>

      <Button onClick={handleSubmit} color="primary" className="mt-4">
        Submit
      </Button>
    </div>
  );
};
