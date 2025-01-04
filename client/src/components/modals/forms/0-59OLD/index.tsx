// src/components/modals/forms/0-59OLD/ZeroTo59YearsOldForm.tsx

import React, { useState, useEffect } from 'react';
import {
  Checkbox,
  CheckboxGroup,
  Input,
  Select,
  SelectItem,
  Textarea,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import axios from 'axios';

export const ZEROTO59MONTHFORM = ({
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
    pwd_number: string;
    nhts_pr_id: string;
    cct_id_number: string;
    phic_id_number: string;
    indigenous_people: boolean;
    ethnic_group: string;
    marital_status: string;
    suspected_cases: string;
    suspected_cases_referred: string;
    visit_dates: {
      visit1: string | null;
      visit2: string | null;
      visit3: string | null;
    };
    vision_test: string;
    referral_options: string[];
    remarks: string;
  };

  type TransformedFormValuesType = Omit<
    FormValuesType,
    'visit_dates' | 'referral_options'
  > & {
    visit_dates: string;
    referral_options: string;
  };

  const [formValues, setFormValues] = useState<FormValuesType>({
    worker_id: sessionStorage.getItem('id') || '',
    client_id: data?.id || '',
    pwd_number: '',
    nhts_pr_id: '',
    cct_id_number: '',
    phic_id_number: '',
    indigenous_people: false,
    ethnic_group: '',
    marital_status: '',
    suspected_cases: '',
    suspected_cases_referred: '',
    visit_dates: {
      visit1: null,
      visit2: null,
      visit3: null,
    },
    vision_test: '',
    referral_options: [],
    remarks: '',
  });

  const [isIndigenous, setIsIndigenous] = useState<boolean>(false);

  useEffect(() => {
    if (selectedData) {
      // Check if visit_dates is a string and parse it if necessary
      let parsedVisitDates = selectedData.visit_dates;
      if (typeof selectedData.visit_dates === 'string') {
        try {
          parsedVisitDates = JSON.parse(selectedData.visit_dates);
        } catch (error) {
          console.error('Error parsing visit_dates:', error);
          parsedVisitDates = {
            visit1: null,
            visit2: null,
            visit3: null,
          };
        }
      }

      setFormValues({
        worker_id: selectedData.worker_id,
        client_id: selectedData.client_id,
        pwd_number: selectedData.pwd_number,
        nhts_pr_id: selectedData.nhts_pr_id,
        cct_id_number: selectedData.cct_id_number,
        phic_id_number: selectedData.phic_id_number,
        indigenous_people: selectedData.indigenous_people,
        ethnic_group: selectedData.ethnic_group,
        marital_status: selectedData.marital_status,
        suspected_cases: selectedData.suspected_cases,
        suspected_cases_referred: selectedData.suspected_cases_referred,
        visit_dates: {
          visit1: parsedVisitDates.visit1 || null,
          visit2: parsedVisitDates.visit2 || null,
          visit3: parsedVisitDates.visit3 || null,
        },
        vision_test: selectedData.vision_test,
        referral_options: selectedData.referral_options || [],
        remarks: selectedData.remarks || '',
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormValues({ ...formValues, [id]: value });
  };

  const handleCheckboxChange = (isSelected: boolean) => {
    setFormValues({ ...formValues, indigenous_people: isSelected });
    setIsIndigenous(isSelected);
  };

  const handleVisitDateChange = (field: keyof FormValuesType['visit_dates'], value: string | null) => {
    setFormValues({
      ...formValues,
      visit_dates: {
        ...formValues.visit_dates,
        [field]: value,
      },
    });
  };

  const handleReferralOptionsChange = (selected: string[]) => {
    setFormValues({ ...formValues, referral_options: selected });
  };

  const handleSubmit = async () => {
    try {
      const transformedFormValues: TransformedFormValuesType = {
        ...formValues,
        visit_dates: JSON.stringify(formValues.visit_dates),
        referral_options: JSON.stringify(formValues.referral_options),
      };

      let successMessage = '';

      if (selectedData && selectedData.id) {
        // Update existing data
        const response = await axios.put(
          `https://https://health-center-repo-production.up.railway.app/zero_to_fiftynine/${selectedData.id}`,
          transformedFormValues
        );
        successMessage = response.data.message || 'Data updated successfully!';
        console.log('Data updated successfully:', response.data);
      } else {
        // Create new data
        const response = await axios.post(
          'https://https://health-center-repo-production.up.railway.app/zero_to_fiftynine',
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
          {selectedData ? 'Edit 0-59 Years Old Screened Data' : 'Add 0-59 Years Old Screened Data'}
        </ModalHeader>
        <ModalBody>
          <form>
            <div className="space-y-6">
              {/* PWD Number */}
              <div className="flex flex-col space-y-2">
                <label htmlFor="pwd_number" className="font-semibold">PWD Number</label>
                <Input
                  type="text"
                  id="pwd_number"
                  fullWidth
                  value={formValues.pwd_number}
                  onChange={handleInputChange}
                />
              </div>

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
              <div className="flex items-center space-x-2 my-4">
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

              {/* Screening Results */}
              <h2 className="text-xl font-bold mt-6">Screening Results</h2>
              <p className="font-semibold mt-2">Date of Client Visit</p>
              <div className="flex flex-wrap gap-4">
                <Input
                  type="date"
                  label='1st Visit'
                  className="flex-1"
                  value={formValues.visit_dates.visit1 || ''}
                  onChange={(e) => handleVisitDateChange('visit1', e.target.value)}
                />
                <Input
                  type="date"
                  label='2nd Visit'
                  className="flex-1"
                  value={formValues.visit_dates.visit2 || ''}
                  onChange={(e) => handleVisitDateChange('visit2', e.target.value)}
                />
                <Input
                  type="date"
                  label='3rd Visit'
                  className="flex-1"
                  value={formValues.visit_dates.visit3 || ''}
                  onChange={(e) => handleVisitDateChange('visit3', e.target.value)}
                />
              </div>

              <Select
                id="vision_test"
                placeholder="Select Vision Test"
                fullWidth
                selectedKeys={new Set([formValues.vision_test])}
                onSelectionChange={(keys) =>
                  setFormValues({ ...formValues, vision_test: Array.from(keys).join('') })
                }
                className="mt-4"
              >
                <SelectItem key='visualAcuity'>Visual Acuity</SelectItem>
                <SelectItem key='pinholeVision'>Pinhole Vision</SelectItem>
              </Select>

              {/* Management */}
              <h2 className="text-xl font-bold mt-6">Management</h2>
              <CheckboxGroup
                label="Select Referral Options"
                defaultValue={["Referred Immediately"]}
                className="space-y-2 mt-2"
                value={formValues.referral_options}
                onChange={(selected: string[]) => handleReferralOptionsChange(selected)}
              >
                <Checkbox value="Referred Immediately">Referred Immediately</Checkbox>
                <Checkbox value="Referred to Optometrist">Referred to Optometrist</Checkbox>
                <Checkbox value="Referred to Ophthalmologist">Referred to Ophthalmologist</Checkbox>
              </CheckboxGroup>

              {/* Remarks */}
              <div className="flex flex-col space-y-2 mt-4">
                <Textarea
                  label='Remarks'
                  fullWidth
                  id="remarks"
                  value={formValues.remarks}
                  onChange={handleInputChange}
                />
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
