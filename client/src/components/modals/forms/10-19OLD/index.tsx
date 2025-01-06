// TentoNineteenForm.tsx

import axios from 'axios';
import {
  Checkbox,
  DatePicker,
  Input,
  Textarea,
  Button,
  DateValue,
} from '@nextui-org/react';
import React, { useState, useEffect } from 'react';
import { parseDate } from '@internationalized/date';

export const TentoNineteenForm = ({
  data,
  selectedData,
}: {
  data: any; // ClientType | null
  selectedData: any;
}) => {
  // Define internal types
  type AgeDetailType = {
    age: number;
    dateGiven1: DateValue | null;
    dateGiven2: DateValue | null;
  };

  type ImmunizationServicesType = {
    hpvDose1: DateValue | null;
    hpvDose2: DateValue | null;
    schoolBasedDose1: DateValue | null;
    schoolBasedDose2: DateValue | null;
  };

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
    ageDetails: AgeDetailType[];
    immunizationServices: ImmunizationServicesType;
    additional_comments: string;
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
    ageDetails:
      selectedData?.ageDetails ||
      Array.from({ length: 10 }, (_, i) => ({
        age: 10 + i,
        dateGiven1: null,
        dateGiven2: null,
      })),
    immunizationServices:
      selectedData?.immunizationServices || {
        hpvDose1: null,
        hpvDose2: null,
        schoolBasedDose1: null,
        schoolBasedDose2: null,
      },
    additional_comments: selectedData?.additional_comments || '',
  });

  useEffect(() => {
    if (selectedData) {
      // Parse ageDetails
      const parsedAgeDetails = selectedData.age_details
        ? JSON.parse(selectedData.age_details).map((detail: any) => ({
            ...detail,
            dateGiven1: detail.dateGiven1 ? parseDate(detail.dateGiven1) : null,
            dateGiven2: detail.dateGiven2 ? parseDate(detail.dateGiven2) : null,
          }))
        : formValues.ageDetails;

      // Parse immunizationServices
      const immunizationData = selectedData.immunization_services
        ? JSON.parse(selectedData.immunization_services)
        : formValues.immunizationServices;

      const parsedImmunizationServices = {
        hpvDose1: immunizationData.hpvDose1
          ? parseDate(immunizationData.hpvDose1)
          : null,
        hpvDose2: immunizationData.hpvDose2
          ? parseDate(immunizationData.hpvDose2)
          : null,
        schoolBasedDose1: immunizationData.schoolBasedDose1
          ? parseDate(immunizationData.schoolBasedDose1)
          : null,
        schoolBasedDose2: immunizationData.schoolBasedDose2
          ? parseDate(immunizationData.schoolBasedDose2)
          : null,
      };

      // Update form values with the parsed data
      setFormValues((prevValues) => ({
        ...prevValues,
        ...selectedData,
        ageDetails: parsedAgeDetails,
        immunizationServices: parsedImmunizationServices,
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

  // Calculate BMI whenever height or weight changes
  useEffect(() => {
    const { height, weight } = formValues;
    if (height && weight) {
      const heightInMeters = parseFloat(height) / 100;
      const weightInKg = parseFloat(weight);
      if (heightInMeters > 0 && weightInKg > 0) {
        const bmiValue = weightInKg / (heightInMeters * heightInMeters);
        const bmiRounded = bmiValue.toFixed(2);
        setFormValues((prevValues) => ({
          ...prevValues,
          bmi: bmiRounded,
        }));
      } else {
        setFormValues((prevValues) => ({
          ...prevValues,
          bmi: '',
        }));
      }
    } else {
      setFormValues((prevValues) => ({
        ...prevValues,
        bmi: '',
      }));
    }
  }, [formValues.height, formValues.weight]);

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

  const handleAgeDetailChange = (
    index: number,
    field: 'dateGiven1' | 'dateGiven2',
    value: DateValue | null
  ) => {
    const updatedAgeDetails = [...formValues.ageDetails];
    updatedAgeDetails[index] = {
      ...updatedAgeDetails[index],
      [field]: value,
    };
    setFormValues({ ...formValues, ageDetails: updatedAgeDetails });
  };

  const handleImmunizationChange = (
    field: keyof ImmunizationServicesType,
    value: DateValue | null
  ) => {
    setFormValues({
      ...formValues,
      immunizationServices: {
        ...formValues.immunizationServices,
        [field]: value,
      },
    });
  };

  const handleSubmit = async () => {
    try {
      // Transform date values to strings before submission
      const transformedFormValues = {
        ...formValues,
        ageDetails: formValues.ageDetails.map((detail) => ({
          ...detail,
          dateGiven1: detail.dateGiven1
            ? detail.dateGiven1.toString()
            : null,
          dateGiven2: detail.dateGiven2
            ? detail.dateGiven2.toString()
            : null,
        })),
        immunizationServices: {
          hpvDose1: formValues.immunizationServices.hpvDose1
            ? formValues.immunizationServices.hpvDose1.toString()
            : null,
          hpvDose2: formValues.immunizationServices.hpvDose2
            ? formValues.immunizationServices.hpvDose2.toString()
            : null,
          schoolBasedDose1: formValues.immunizationServices.schoolBasedDose1
            ? formValues.immunizationServices.schoolBasedDose1.toString()
            : null,
          schoolBasedDose2: formValues.immunizationServices.schoolBasedDose2
            ? formValues.immunizationServices.schoolBasedDose2.toString()
            : null,
        },
      };

      if (selectedData && selectedData.id) {
        // We're updating existing data
        const response = await axios.put(
          `https://health-center-repo-production.up.railway.app/10-19yo/${selectedData.id}`,
          transformedFormValues
        );
        alert('Data updated successfully!');
        console.log('Data updated successfully:', response.data);
      } else {
        // We're creating new data
        const response = await axios.post(
          'https://health-center-repo-production.up.railway.app/10-19yo',
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
    <div className="p-4 max-w-2xl bg-white ">
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
        </div>
        {isChecked && (
          <div className="mt-4">
            <Input
              id="ethnic_group"
              label="Ethnic Group"
              fullWidth
              value={formValues.ethnic_group}
              onChange={handleInputChange}
            />
          </div>
        )}
      </section>

      {/* Client Name */}
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">Client Name</h2>
        <div>
          <Input label="FULL NAME" fullWidth value={data?.fname || ''} readOnly />
        </div>
      </section>

      {/* Complete Address */}
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">Complete Address</h2>
        <div>
          <Input label="ADDRESS" fullWidth value={data?.address || ''} readOnly />
        </div>
      </section>

      {/* Height, Weight, and BMI */}
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">Health Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
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
        </div>
        <Input
          id="educational_status"
          label="Educational Status"
          fullWidth
          value={formValues.educational_status}
          onChange={handleInputChange}
        />
      </section>

      {/* Age and Dates Given */}
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">Age Details</h2>
        {formValues.ageDetails.map((ageDetail, index) => (
          <div key={index} className="mb-4">
            <p>{ageDetail.age} years old</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker
                label="Date Given 1"
                fullWidth
                value={ageDetail.dateGiven1}
                onChange={(value) =>
                  handleAgeDetailChange(index, 'dateGiven1', value)
                }
              />
              <DatePicker
                label="Date Given 2"
                fullWidth
                value={ageDetail.dateGiven2}
                onChange={(value) =>
                  handleAgeDetailChange(index, 'dateGiven2', value)
                }
              />
            </div>
          </div>
        ))}
      </section>

      {/* Immunization Services */}
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">Immunization Services</h2>
        <p>HPV</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker
            label="1st Dose"
            fullWidth
            value={formValues.immunizationServices.hpvDose1}
            onChange={(value) => handleImmunizationChange('hpvDose1', value)}
          />
          <DatePicker
            label="2nd Dose"
            fullWidth
            value={formValues.immunizationServices.hpvDose2}
            onChange={(value) => handleImmunizationChange('hpvDose2', value)}
          />
        </div>
        <p className="my-4">School-based Immunization (GRADE 7)</p>
        <div className="mb-4 flex flex-col gap-2">
          <DatePicker
            label="Date Given 1"
            fullWidth
            value={formValues.immunizationServices.schoolBasedDose1}
            onChange={(value) =>
              handleImmunizationChange('schoolBasedDose1', value)
            }
          />
          <DatePicker
            label="Date Given 2"
            fullWidth
            value={formValues.immunizationServices.schoolBasedDose2}
            onChange={(value) =>
              handleImmunizationChange('schoolBasedDose2', value)
            }
          />
        </div>
      </section>

      {/* Additional Comments */}
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">Additional Comments</h2>
        <Textarea
          id="additional_comments"
          placeholder="Any additional information..."
          fullWidth
          value={formValues.additional_comments}
          onChange={handleInputChange}
        />
      </section>

      <Button onClick={handleSubmit} color="primary" className="mt-4">
        Submit
      </Button>
    </div>
  );
};
