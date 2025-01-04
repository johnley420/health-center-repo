// CurrentSmokerForm.tsx

import React, { useState, useEffect } from 'react';
import {
  Input,
  Checkbox,
  Select,
  SelectItem,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';
import axios from 'axios';

export const CurrentSmokerForm = ({
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
    sex: string;
    complete_address: string;
    suspected_cases: string;
    suspected_cases_referred: string;
  };

  type TransformedFormValuesType = Omit<
    FormValuesType,
    'complete_address'
  >;

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
    sex: '',
    complete_address: data?.address || '',
    suspected_cases: '',
    suspected_cases_referred: '',
  });

  const [isIndigenous, setIsIndigenous] = useState<boolean>(false);

  useEffect(() => {
    if (selectedData) {
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
        sex: selectedData.sex,
        complete_address: data?.address || '',
        suspected_cases: selectedData.suspected_cases,
        suspected_cases_referred: selectedData.suspected_cases_referred,
      });
      setIsIndigenous(selectedData.indigenous_people);
    } else {
      // Initialize form with data from selected client
      setFormValues((prevValues) => ({
        ...prevValues,
        client_id: data?.id || '',
        complete_address: data?.address || '',
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

  const handleSubmit = async () => {
    try {
      const transformedFormValues: TransformedFormValuesType = {
        ...formValues,
      };

      let successMessage = '';

      if (selectedData && selectedData.id) {
        // Update existing data
        const response = await axios.put(
          `https://https://health-center-repo-production.up.railway.app/currentsmokers/${selectedData.id}`,
          transformedFormValues
        );
        successMessage = response.data.message || 'Data updated successfully!';
        console.log('Data updated successfully:', response.data);
      } else {
        // Create new data
        const response = await axios.post(
          'https://https://health-center-repo-production.up.railway.app/currentsmokers',
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
          {selectedData ? 'Edit Current Smoker Data' : 'Add Current Smoker Data'}
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
              <div className="flex items-center space-x-2 mt-4">
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

              {/* Sex */}
              <h2 className="text-xl font-bold mt-6">Sex</h2>
              <Select
                id="sex"
                placeholder="Select Sex"
                fullWidth
                selectedKeys={new Set([formValues.sex])}
                onSelectionChange={(keys) =>
                  setFormValues({ ...formValues, sex: Array.from(keys).join('') })
                }
              >
                <SelectItem key="Male">Male</SelectItem>
                <SelectItem key="Female">Female</SelectItem>
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

              {/* Suspected Cases */}
              <h2 className="text-xl font-bold mt-6">Suspected Smoking Cases</h2>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1">
                  <Input
                    label="Number of Suspected Cases"
                    id="suspected_cases"
                    fullWidth
                    value={formValues.suspected_cases}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    label="Cases Referred to Health Facility"
                    id="suspected_cases_referred"
                    fullWidth
                    value={formValues.suspected_cases_referred}
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
