// Zeroto11Form.tsx

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

export const Zeroto11Form = ({
  data,
  selectedData,
}: {
  data: any; // Replace 'any' with your 'ClientType' if available
  selectedData: any;
}) => {
  // Define types
  type ImmunizationsType = {
    opv: { dose1: DateValue | null; dose2: DateValue | null; dose3: DateValue | null };
    ipv: { dose1: DateValue | null };
    pentavalent: { dose1: DateValue | null; dose2: DateValue | null; dose3: DateValue | null };
    pcv: { dose1: DateValue | null; dose2: DateValue | null; dose3: DateValue | null };
    mmr: { dose1: DateValue | null; dose2: DateValue | null };
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
    low_birth_weight_infants: string;
    newborn_birth_weight: string;
    newborn_birth_height: string;
    infant_underwent_newborn_screening: DateValue | null;
    date_of_immunization: DateValue | null;
    date_child_reached_one: DateValue | null;
    date_child_fully_immunized: DateValue | null;
    date_infant_reaches_six_months: DateValue | null;
    breastfeeding_details: string;
    remarks: string;
    immunizations: ImmunizationsType;
  };

  type TransformedFormValuesType = Omit<
    FormValuesType,
    | 'immunizations'
    | 'infant_underwent_newborn_screening'
    | 'date_of_immunization'
    | 'date_child_reached_one'
    | 'date_child_fully_immunized'
    | 'date_infant_reaches_six_months'
  > & {
    immunizations: string;
    infant_underwent_newborn_screening: string | null;
    date_of_immunization: string | null;
    date_child_reached_one: string | null;
    date_child_fully_immunized: string | null;
    date_infant_reaches_six_months: string | null;
  };

  type ImmunizationCategory = keyof ImmunizationsType; // 'opv' | 'ipv' | 'pentavalent' | 'pcv' | 'mmr'

  type ImmunizationDoseKey<C extends ImmunizationCategory> = keyof ImmunizationsType[C];

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
    low_birth_weight_infants: selectedData?.low_birth_weight_infants || '',
    newborn_birth_weight: selectedData?.newborn_birth_weight || '',
    newborn_birth_height: selectedData?.newborn_birth_height || '',
    infant_underwent_newborn_screening: null,
    date_of_immunization: null,
    date_child_reached_one: null,
    date_child_fully_immunized: null,
    date_infant_reaches_six_months: null,
    breastfeeding_details: selectedData?.breastfeeding_details || '',
    remarks: selectedData?.remarks || '',
    immunizations: {
      opv: {
        dose1: null,
        dose2: null,
        dose3: null,
      },
      ipv: {
        dose1: null,
      },
      pentavalent: {
        dose1: null,
        dose2: null,
        dose3: null,
      },
      pcv: {
        dose1: null,
        dose2: null,
        dose3: null,
      },
      mmr: {
        dose1: null,
        dose2: null,
      },
    },
  });

  useEffect(() => {
    if (selectedData) {
      // Helper function to parse date strings
      const parseDateString = (dateString: string | null): DateValue | null => {
        if (!dateString) return null;
        const datePart = dateString.split('T')[0]; // Get the date part
        return parseDate(datePart);
      };

      // Parse immunization dates
      const immunizationsData = selectedData.immunizations
        ? JSON.parse(selectedData.immunizations)
        : formValues.immunizations;

      const parsedImmunizations: ImmunizationsType = {
        opv: {
          dose1: parseDateString(immunizationsData.opv.dose1),
          dose2: parseDateString(immunizationsData.opv.dose2),
          dose3: parseDateString(immunizationsData.opv.dose3),
        },
        ipv: {
          dose1: parseDateString(immunizationsData.ipv.dose1),
        },
        pentavalent: {
          dose1: parseDateString(immunizationsData.pentavalent.dose1),
          dose2: parseDateString(immunizationsData.pentavalent.dose2),
          dose3: parseDateString(immunizationsData.pentavalent.dose3),
        },
        pcv: {
          dose1: parseDateString(immunizationsData.pcv.dose1),
          dose2: parseDateString(immunizationsData.pcv.dose2),
          dose3: parseDateString(immunizationsData.pcv.dose3),
        },
        mmr: {
          dose1: parseDateString(immunizationsData.mmr.dose1),
          dose2: parseDateString(immunizationsData.mmr.dose2),
        },
      };

      // Update form values with selected data
      setFormValues((prevValues) => ({
        ...prevValues,
        ...selectedData,
        infant_underwent_newborn_screening: parseDateString(
          selectedData.infant_underwent_newborn_screening
        ),
        date_of_immunization: parseDateString(selectedData.date_of_immunization),
        date_child_reached_one: parseDateString(selectedData.date_child_reached_one),
        date_child_fully_immunized: parseDateString(selectedData.date_child_fully_immunized),
        date_infant_reaches_six_months: parseDateString(selectedData.date_infant_reaches_six_months),
        immunizations: parsedImmunizations,
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

  const handleDateChange = (field: keyof FormValuesType, value: DateValue | null) => {
    setFormValues({ ...formValues, [field]: value });
  };

  const handleImmunizationDateChange = <C extends ImmunizationCategory>(
    category: C,
    dose: ImmunizationDoseKey<C>,
    value: DateValue | null
  ) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      immunizations: {
        ...prevValues.immunizations,
        [category]: {
          ...prevValues.immunizations[category],
          [dose]: value,
        },
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      const transformedFormValues: TransformedFormValuesType = {
        worker_id: formValues.worker_id,
        client_id: formValues.client_id,
        pwd_number: formValues.pwd_number,
        nhts_pr_id: formValues.nhts_pr_id,
        cct_id_number: formValues.cct_id_number,
        phic_id_number: formValues.phic_id_number,
        indigenous_people: formValues.indigenous_people,
        ethnic_group: formValues.ethnic_group,
        low_birth_weight_infants: formValues.low_birth_weight_infants,
        newborn_birth_weight: formValues.newborn_birth_weight,
        newborn_birth_height: formValues.newborn_birth_height,
        infant_underwent_newborn_screening: formValues.infant_underwent_newborn_screening
          ? formValues.infant_underwent_newborn_screening.toString()
          : null,
        date_of_immunization: formValues.date_of_immunization
          ? formValues.date_of_immunization.toString()
          : null,
        date_child_reached_one: formValues.date_child_reached_one
          ? formValues.date_child_reached_one.toString()
          : null,
        date_child_fully_immunized: formValues.date_child_fully_immunized
          ? formValues.date_child_fully_immunized.toString()
          : null,
        date_infant_reaches_six_months: formValues.date_infant_reaches_six_months
          ? formValues.date_infant_reaches_six_months.toString()
          : null,
        breastfeeding_details: formValues.breastfeeding_details,
        remarks: formValues.remarks,
        immunizations: JSON.stringify({
          opv: {
            dose1: formValues.immunizations.opv.dose1
              ? formValues.immunizations.opv.dose1.toString()
              : null,
            dose2: formValues.immunizations.opv.dose2
              ? formValues.immunizations.opv.dose2.toString()
              : null,
            dose3: formValues.immunizations.opv.dose3
              ? formValues.immunizations.opv.dose3.toString()
              : null,
          },
          ipv: {
            dose1: formValues.immunizations.ipv.dose1
              ? formValues.immunizations.ipv.dose1.toString()
              : null,
          },
          pentavalent: {
            dose1: formValues.immunizations.pentavalent.dose1
              ? formValues.immunizations.pentavalent.dose1.toString()
              : null,
            dose2: formValues.immunizations.pentavalent.dose2
              ? formValues.immunizations.pentavalent.dose2.toString()
              : null,
            dose3: formValues.immunizations.pentavalent.dose3
              ? formValues.immunizations.pentavalent.dose3.toString()
              : null,
          },
          pcv: {
            dose1: formValues.immunizations.pcv.dose1
              ? formValues.immunizations.pcv.dose1.toString()
              : null,
            dose2: formValues.immunizations.pcv.dose2
              ? formValues.immunizations.pcv.dose2.toString()
              : null,
            dose3: formValues.immunizations.pcv.dose3
              ? formValues.immunizations.pcv.dose3.toString()
              : null,
          },
          mmr: {
            dose1: formValues.immunizations.mmr.dose1
              ? formValues.immunizations.mmr.dose1.toString()
              : null,
            dose2: formValues.immunizations.mmr.dose2
              ? formValues.immunizations.mmr.dose2.toString()
              : null,
          },
        }),
      };

      let successMessage = '';

      // Proceed with submission (POST or PUT request)
      if (selectedData && selectedData.id) {
        // Update existing data
        const response = await axios.put(
          `https://https://health-center-repo-production.up.railway.app/0-11monthsold/${selectedData.id}`,
          transformedFormValues
        );
        successMessage = response.data.message || 'Data updated successfully!';
        console.log('Data updated successfully:', response.data);
      } else {
        // Create new data
        const response = await axios.post(
          'https://https://health-center-repo-production.up.railway.app/0-11monthsold',
          transformedFormValues
        );
        successMessage = response.data.message || 'Data submitted successfully!';
        console.log('Data submitted successfully:', response.data);
      }

      alert(successMessage);
    } catch (error: any) {
      console.error('Error submitting data:', error);
      alert('An error occurred while submitting data.');
    }
  };

  return (
    <div className="p-6">
      <form>
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

        {/* NHTS-PR IDs */}
        <h2 className="text-xl font-semibold mb-4">NHTS-PR</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Input
            label="NHTS-PR ID NUMBER"
            id="nhts_pr_id"
            fullWidth
            value={formValues.nhts_pr_id}
            onChange={handleInputChange}
          />
          <Input
            label="4Ps/CCT ID NUMBER"
            id="cct_id_number"
            fullWidth
            value={formValues.cct_id_number}
            onChange={handleInputChange}
          />
          <Input
            label="PHIC ID NUMBER"
            id="phic_id_number"
            fullWidth
            value={formValues.phic_id_number}
            onChange={handleInputChange}
          />
        </div>

        {/* Indigenous People Checkbox */}
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

        {/* Child's Name */}
        <h2 className="text-xl font-semibold mb-4">Name of Child</h2>
        <div className="mb-6">
          <Input label="Full Name" fullWidth value={data?.fname || ''} readOnly />
        </div>

        {/* Address */}
        <h2 className="text-xl font-semibold mb-4">Complete Address</h2>
        <div className="mb-6">
          <Input label="Address" fullWidth value={data?.address || ''} readOnly />
        </div>

        {/* Newborn Information */}
        <h2 className="text-xl font-semibold mb-4">Newborn Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Input
            label="Newborn Birth Weight (grams)"
            id="newborn_birth_weight"
            fullWidth
            value={formValues.newborn_birth_weight}
            onChange={handleInputChange}
          />
          <Input
            label="Newborn Birth Height (centimeters)"
            id="newborn_birth_height"
            fullWidth
            value={formValues.newborn_birth_height}
            onChange={handleInputChange}
          />
          <Input
            label="Low Birth Weight Infants"
            id="low_birth_weight_infants"
            fullWidth
            value={formValues.low_birth_weight_infants}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <DatePicker
            label="Infant Underwent Newborn Screening"
            value={formValues.infant_underwent_newborn_screening}
            onChange={(value) =>
              handleDateChange('infant_underwent_newborn_screening', value)
            }
            fullWidth
          />
          <DatePicker
            label="Date of Immunization"
            value={formValues.date_of_immunization}
            onChange={(value) => handleDateChange('date_of_immunization', value)}
            fullWidth
          />
        </div>

        {/* Immunization Dates */}
        <h3 className="text-lg font-semibold mb-4">Date Immunization Received</h3>

        <h4 className="font-semibold mb-2">OPV</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <DatePicker
            label="1"
            value={formValues.immunizations.opv.dose1}
            onChange={(value) => handleImmunizationDateChange('opv', 'dose1', value)}
            fullWidth
          />
          <DatePicker
            label="2"
            value={formValues.immunizations.opv.dose2}
            onChange={(value) => handleImmunizationDateChange('opv', 'dose2', value)}
            fullWidth
          />
          <DatePicker
            label="3"
            value={formValues.immunizations.opv.dose3}
            onChange={(value) => handleImmunizationDateChange('opv', 'dose3', value)}
            fullWidth
          />
        </div>

        <h4 className="font-semibold mb-2">IPV</h4>
        <div className="mb-6">
          <DatePicker
            label="1"
            value={formValues.immunizations.ipv.dose1}
            onChange={(value) => handleImmunizationDateChange('ipv', 'dose1', value)}
            fullWidth
          />
        </div>

        <h4 className="font-semibold mb-2">Pentavalent</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <DatePicker
            label="1"
            value={formValues.immunizations.pentavalent.dose1}
            onChange={(value) =>
              handleImmunizationDateChange('pentavalent', 'dose1', value)
            }
            fullWidth
          />
          <DatePicker
            label="2"
            value={formValues.immunizations.pentavalent.dose2}
            onChange={(value) =>
              handleImmunizationDateChange('pentavalent', 'dose2', value)
            }
            fullWidth
          />
          <DatePicker
            label="3"
            value={formValues.immunizations.pentavalent.dose3}
            onChange={(value) =>
              handleImmunizationDateChange('pentavalent', 'dose3', value)
            }
            fullWidth
          />
        </div>

        <h4 className="font-semibold mb-2">PCV</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <DatePicker
            label="1"
            value={formValues.immunizations.pcv.dose1}
            onChange={(value) => handleImmunizationDateChange('pcv', 'dose1', value)}
            fullWidth
          />
          <DatePicker
            label="2"
            value={formValues.immunizations.pcv.dose2}
            onChange={(value) => handleImmunizationDateChange('pcv', 'dose2', value)}
            fullWidth
          />
          <DatePicker
            label="3"
            value={formValues.immunizations.pcv.dose3}
            onChange={(value) => handleImmunizationDateChange('pcv', 'dose3', value)}
            fullWidth
          />
        </div>

        <h4 className="font-semibold mb-2">MMR</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <DatePicker
            label="MMR 1"
            value={formValues.immunizations.mmr.dose1}
            onChange={(value) => handleImmunizationDateChange('mmr', 'dose1', value)}
            fullWidth
          />
          <DatePicker
            label="MMR 2"
            value={formValues.immunizations.mmr.dose2}
            onChange={(value) => handleImmunizationDateChange('mmr', 'dose2', value)}
            fullWidth
          />
        </div>

        {/* Other Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <DatePicker
            label="Date Child Reached Age 1"
            value={formValues.date_child_reached_one}
            onChange={(value) => handleDateChange('date_child_reached_one', value)}
            fullWidth
          />
          <DatePicker
            label="Date Child Fully Immunized"
            value={formValues.date_child_fully_immunized}
            onChange={(value) => handleDateChange('date_child_fully_immunized', value)}
            fullWidth
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <DatePicker
            label="Date Infant Reaches 6 Months Old"
            value={formValues.date_infant_reaches_six_months}
            onChange={(value) => handleDateChange('date_infant_reaches_six_months', value)}
            fullWidth
          />
        </div>

        {/* Breastfeeding Section */}
        <h3 className="text-lg font-semibold mb-4">
          Date and Age (Months) Infant Seen and Exclusively Breastfed
        </h3>
        <div className="mb-6">
          <Textarea
            id="breastfeeding_details"
            fullWidth
            placeholder="Enter details..."
            value={formValues.breastfeeding_details}
            onChange={handleInputChange}
          />
        </div>

        {/* Remarks Section */}
        <h3 className="text-lg font-semibold mb-4">Remarks</h3>
        <div className="mb-6">
          <Textarea
            id="remarks"
            fullWidth
            placeholder="Enter remarks..."
            value={formValues.remarks}
            onChange={handleInputChange}
          />
        </div>

        <Button onClick={handleSubmit} color="primary" className="mt-4">
          Submit
        </Button>
      </form>
    </div>
  );
};
