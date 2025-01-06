// SchistosomiasisForm.tsx

import React, { useState, useEffect } from 'react';
import {
  Input,
  Checkbox,
  Select,
  SelectItem,
  DatePicker,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  DateValue,
} from '@nextui-org/react';
import axios from 'axios';
import { parseDate } from '@internationalized/date';

export const SchistosomiasisForm = ({
  isOpen,
  onClose,
  data,
  selectedData,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  selectedData: any;
}) => {
  type FormValuesType = {
    worker_id: string;
    client_id: number | '';
    nhts_pr_id: string;
    cct_id_number: string;
    phic_id_number: string;
    indigenous_people: boolean;
    ethnic_group: string;
    marital_status: string;
    mass_drug_administration_dates: {
      date1: DateValue | null;
      date2: DateValue | null;
      date3: DateValue | null;
      date4: DateValue | null;
      date5: DateValue | null;
    };
    suspected_schisto_cases: string;
    suspected_schisto_cases_referred: string;
  };

  type TransformedFormValuesType = Omit<FormValuesType, 'mass_drug_administration_dates'> & {
    mass_drug_administration_dates: string;
  };

  const [formValues, setFormValues] = useState<FormValuesType>({
    worker_id: sessionStorage.getItem('id') || '',
    client_id: data?.id || '',
    nhts_pr_id: '',
    cct_id_number: '',
    phic_id_number: '',
    indigenous_people: false,
    ethnic_group: '',
    marital_status: '',
    mass_drug_administration_dates: {
      date1: null,
      date2: null,
      date3: null,
      date4: null,
      date5: null,
    },
    suspected_schisto_cases: '',
    suspected_schisto_cases_referred: '',
  });

  const [isIndigenous, setIsIndigenous] = useState<boolean>(false);

  useEffect(() => {
    if (selectedData) {
      const parseDateString = (dateString: string | null): DateValue | null => {
        if (!dateString) return null;
        const datePart = dateString.split('T')[0]; // Get the date part
        return parseDate(datePart);
      };

      const massDrugDates = selectedData.mass_drug_administration_dates
        ? JSON.parse(selectedData.mass_drug_administration_dates)
        : formValues.mass_drug_administration_dates;

      setFormValues({
        worker_id: selectedData.worker_id,
        client_id: selectedData.client_id,
        nhts_pr_id: selectedData.nhts_pr_id,
        cct_id_number: selectedData.cct_id_number,
        phic_id_number: selectedData.phic_id_number,
        indigenous_people: selectedData.indigenous_people,
        ethnic_group: selectedData.ethnic_group,
        marital_status: selectedData.marital_status,
        mass_drug_administration_dates: {
          date1: parseDateString(massDrugDates.date1),
          date2: parseDateString(massDrugDates.date2),
          date3: parseDateString(massDrugDates.date3),
          date4: parseDateString(massDrugDates.date4),
          date5: parseDateString(massDrugDates.date5),
        },
        suspected_schisto_cases: selectedData.suspected_schisto_cases,
        suspected_schisto_cases_referred: selectedData.suspected_schisto_cases_referred,
      });
      setIsIndigenous(selectedData.indigenous_people);
    } else {
      // Initialize form with data from selected client
      setFormValues((prevValues) => ({
        ...prevValues,
        client_id: data?.id || '',
      }));
    }
  }, [selectedData, data]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormValues({ ...formValues, [id]: value });
  };

  const handleCheckboxChange = (isSelected: boolean) => {
    setFormValues({ ...formValues, indigenous_people: isSelected });
    setIsIndigenous(isSelected);
  };

  const handleMassDrugDateChange = (
    dateField: keyof FormValuesType['mass_drug_administration_dates'],
    value: DateValue | null
  ) => {
    setFormValues({
      ...formValues,
      mass_drug_administration_dates: {
        ...formValues.mass_drug_administration_dates,
        [dateField]: value,
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const transformedFormValues: TransformedFormValuesType = {
        ...formValues,
        mass_drug_administration_dates: JSON.stringify({
          date1: formValues.mass_drug_administration_dates.date1
            ? formValues.mass_drug_administration_dates.date1.toString()
            : null,
          date2: formValues.mass_drug_administration_dates.date2
            ? formValues.mass_drug_administration_dates.date2.toString()
            : null,
          date3: formValues.mass_drug_administration_dates.date3
            ? formValues.mass_drug_administration_dates.date3.toString()
            : null,
          date4: formValues.mass_drug_administration_dates.date4
            ? formValues.mass_drug_administration_dates.date4.toString()
            : null,
          date5: formValues.mass_drug_administration_dates.date5
            ? formValues.mass_drug_administration_dates.date5.toString()
            : null,
        }),
      };

      let successMessage = '';

      if (selectedData && selectedData.id) {
        // Update existing data
        const response = await axios.put(
          `http://localhost:8081/schistosomiasis/${selectedData.id}`,
          transformedFormValues
        );
        successMessage = response.data.message || 'Data updated successfully!';
        console.log('Data updated successfully:', response.data);
      } else {
        // Create new data
        const response = await axios.post(
          'http://localhost:8081/schistosomiasis',
          transformedFormValues
        );
        successMessage = response.data.message || 'Data submitted successfully!';
        console.log('Data submitted successfully:', response.data);
      }

      alert(successMessage);
      onClose();
    } catch (error: any) {
      console.error('Error submitting data:', error);
      alert('An error occurred while submitting data.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      size="lg" // Adjust the size as needed ('sm', 'md', 'lg', 'fullscreen')
    >
      <ModalContent>
        <ModalHeader>
          {selectedData ? 'Edit Schistosomiasis Data' : 'Add Schistosomiasis Data'}
        </ModalHeader>
        <ModalBody>
          <form>
            <div className="space-y-6">
              {/* NHTS-PR IDs */}
              <h2 className="text-xl font-bold mt-6">NHTS-PR</h2>
              <div className="flex flex-wrap gap-4">
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
              <div className="mt-4">
                <Checkbox
                  id="indigenous_people"
                  isSelected={isIndigenous}
                  onValueChange={handleCheckboxChange}
                >
                  Indigenous People
                </Checkbox>
              </div>
              {isIndigenous && (
                <div className="mt-2">
                  <Input
                    label="Ethnic Group"
                    id="ethnic_group"
                    fullWidth
                    value={formValues.ethnic_group}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {/* Full Name */}
              <h2 className="text-xl font-bold mt-6">Full Name</h2>
              <div className="mt-2">
                <Input
                  label="Full Name"
                  fullWidth
                  value={data?.fname || ''}
                  readOnly
                />
              </div>

              {/* Marital Status */}
              <h2 className="text-xl font-bold mt-6">Marital Status</h2>
              <Select
                id="marital_status"
                placeholder="Select Marital Status"
                fullWidth
                selectedKeys={new Set([formValues.marital_status])}
                onSelectionChange={(keys) =>
                  setFormValues({ ...formValues, marital_status: Array.from(keys).join('') })
                }
              >
                <SelectItem key="Married">Married</SelectItem>
                <SelectItem key="Single">Single</SelectItem>
                <SelectItem key="Widow">Widow</SelectItem>
                <SelectItem key="Separated">Separated</SelectItem>
                <SelectItem key="Live-in">Live-in</SelectItem>
              </Select>

              {/* Complete Address */}
              <h2 className="text-xl font-bold mt-6">Complete Address</h2>
              <div className="mt-2">
                <Input
                  label="Complete Address"
                  fullWidth
                  value={data?.address || ''}
                  readOnly
                />
              </div>

              {/* Mass Drug Administration */}
              <h2 className="text-xl font-bold mt-6">Mass Drug Administration</h2>
              <div className="flex flex-col space-y-2">
                <label className="font-semibold">Administration Dates</label>
                <div className="flex flex-wrap gap-2">
                  <DatePicker
                    label="Date 1"
                    value={formValues.mass_drug_administration_dates.date1}
                    onChange={(value) => handleMassDrugDateChange('date1', value)}
                  />
                  <DatePicker
                    label="Date 2"
                    value={formValues.mass_drug_administration_dates.date2}
                    onChange={(value) => handleMassDrugDateChange('date2', value)}
                  />
                  <DatePicker
                    label="Date 3"
                    value={formValues.mass_drug_administration_dates.date3}
                    onChange={(value) => handleMassDrugDateChange('date3', value)}
                  />
                  <DatePicker
                    label="Date 4"
                    value={formValues.mass_drug_administration_dates.date4}
                    onChange={(value) => handleMassDrugDateChange('date4', value)}
                  />
                  <DatePicker
                    label="Date 5"
                    value={formValues.mass_drug_administration_dates.date5}
                    onChange={(value) => handleMassDrugDateChange('date5', value)}
                  />
                </div>
              </div>

              {/* Suspected Schistosomiasis Cases */}
              <h2 className="text-xl font-bold mt-6">Suspected Schistosomiasis Cases</h2>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1">
                  <Input
                    label="Suspected Schisto Cases"
                    id="suspected_schisto_cases"
                    fullWidth
                    value={formValues.suspected_schisto_cases}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    label="Suspected Schisto Cases Referred to Health Facility"
                    id="suspected_schisto_cases_referred"
                    fullWidth
                    value={formValues.suspected_schisto_cases_referred}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSubmit}>
            {selectedData ? 'Update' : 'Submit'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};