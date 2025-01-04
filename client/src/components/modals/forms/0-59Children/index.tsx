// src/components/modals/forms/0-9CHILDMONTH/ZEROTO9CHILDMONTHFORM.tsx

import React, { useState, useEffect } from 'react';
import {
  Checkbox,
  Input,
  Textarea,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import axios from 'axios';

interface ZEROTO9CHILDMONTHFORMProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  selectedData: any;
}

export const ZEROTO9CHILDMONTHFORM: React.FC<ZEROTO9CHILDMONTHFORMProps> = ({
  isOpen,
  onClose,
  data,
  selectedData,
}) => {
  type FormValuesType = {
    worker_id: string;
    client_id: number | '';
    pwd_number: string;
    mother_name: string;
    nhts_pr_id: string;
    cct_id_number: string;
    phic_id_number: string;
    indigenous_people: boolean;
    ethnic_group: string;
    nutrition_info: any;
    remarks: string;
  };

  const [formValues, setFormValues] = useState<FormValuesType>({
    worker_id: sessionStorage.getItem('id') || '',
    client_id: data?.id || '',
    pwd_number: '',
    mother_name: '',
    nhts_pr_id: '',
    cct_id_number: '',
    phic_id_number: '',
    indigenous_people: false,
    ethnic_group: '',
    nutrition_info: {},
    remarks: '',
  });

  const [isIndigenous, setIsIndigenous] = useState<boolean>(false);
  const [clientName, setClientName] = useState<string>(data?.fname || '');
  const [clientAddress, setClientAddress] = useState<string>(data?.address || '');

  useEffect(() => {
    if (selectedData) {
      // Parse nutrition_info if it's a JSON string
      let parsedNutritionInfo = selectedData.nutrition_info;
      if (typeof selectedData.nutrition_info === 'string') {
        try {
          parsedNutritionInfo = JSON.parse(selectedData.nutrition_info);
        } catch (error) {
          console.error('Error parsing nutrition_info:', error);
          parsedNutritionInfo = {};
        }
      }

      setFormValues({
        worker_id: selectedData.worker_id,
        client_id: selectedData.client_id,
        pwd_number: selectedData.pwd_number,
        mother_name: selectedData.mother_name,
        nhts_pr_id: selectedData.nhts_pr_id,
        cct_id_number: selectedData.cct_id_number,
        phic_id_number: selectedData.phic_id_number,
        indigenous_people: selectedData.indigenous_people,
        ethnic_group: selectedData.ethnic_group,
        nutrition_info: parsedNutritionInfo || {},
        remarks: selectedData.remarks || '',
      });
      setIsIndigenous(selectedData.indigenous_people);

      // Fetch client name and address using client_id
      fetchClientDetails(selectedData.client_id);
    } else {
      // Fetch client name and address using client_id
      fetchClientDetails(data?.id || '');
    }
  }, [selectedData, data]);

  const fetchClientDetails = async (clientId: number) => {
    try {
      const response = await axios.get(`https://health-center-repo-production.up.railway.app/clients/${clientId}`);
      if (response.status === 200) {
        const clientData = response.data;
        setClientName(clientData.fname);
        setClientAddress(clientData.address);
      }
    } catch (error) {
      console.error('Error fetching client details:', error);
    }
  };

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

  const handleNutritionInfoChange = (
    ageGroup: string,
    field: string,
    value: string
  ) => {
    // Update the specific field
    setFormValues((prevValues) => ({
      ...prevValues,
      nutrition_info: {
        ...prevValues.nutrition_info,
        [ageGroup]: {
          ...prevValues.nutrition_info[ageGroup],
          [field]: value,
        },
      },
    }));

    // If weight or height is updated, recalculate BMI and nutritional status
    if (field === 'weight' || field === 'height') {
      const currentNutrition = formValues.nutrition_info[ageGroup] || {};
      const weight = parseFloat(
        field === 'weight' ? value : currentNutrition.weight
      );
      const heightCm = parseFloat(
        field === 'height' ? value : currentNutrition.height
      );

      if (weight > 0 && heightCm > 0) {
        const heightM = heightCm / 100;
        const bmi = weight / (heightM * heightM);
        const roundedBMI = bmi.toFixed(2); // Round to two decimal places

        // Determine nutritional status based on BMI
        let nutritionalStatus = '';
        if (bmi < 18.5) {
          nutritionalStatus = 'Underweight';
        } else if (bmi >= 18.5 && bmi < 24.9) {
          nutritionalStatus = 'Normal weight';
        } else if (bmi >= 25 && bmi < 29.9) {
          nutritionalStatus = 'Overweight';
        } else if (bmi >= 30) {
          nutritionalStatus = 'Obesity';
        }

        setFormValues((prevValues) => ({
          ...prevValues,
          nutrition_info: {
            ...prevValues.nutrition_info,
            [ageGroup]: {
              ...prevValues.nutrition_info[ageGroup],
              bmi: roundedBMI,
              nutritional_status: nutritionalStatus,
            },
          },
        }));
      } else {
        // If weight or height is invalid, clear BMI and nutritional status
        setFormValues((prevValues) => ({
          ...prevValues,
          nutrition_info: {
            ...prevValues.nutrition_info,
            [ageGroup]: {
              ...prevValues.nutrition_info[ageGroup],
              bmi: '',
              nutritional_status: '',
            },
          },
        }));
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const transformedFormValues = {
        ...formValues,
        indigenous_people: formValues.indigenous_people ? 1 : 0,
        nutrition_info: JSON.stringify(formValues.nutrition_info),
      };

      let successMessage = '';

      if (selectedData && selectedData.id) {
        // Update existing data
        const response = await axios.put(
          `https://health-center-repo-production.up.railway.app/zero_to_fiftynine_months_children/${selectedData.id}`,
          transformedFormValues
        );
        successMessage = response.data.message || 'Data updated successfully!';
        console.log('Data updated successfully:', response.data);
      } else {
        // Create new data
        const response = await axios.post(
          'https://health-center-repo-production.up.railway.app/zero_to_fiftynine_months_children',
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

  // Define age groups
  const ageGroups = [
    "6-11 months old",
    "12-23 months old",
    "24-35 months old",
    "36-47 months old",
    "48-59 months old",
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      size="lg"
    >
      <ModalContent>
        <ModalHeader>
          {selectedData
            ? 'Edit 0-59 Months Old Children - Nutrition Services Data'
            : 'Add 0-59 Months Old Children - Nutrition Services Data'}
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

              {/* Mother's Name */}
              <div className="flex flex-col space-y-2">
                <label htmlFor="mother_name" className="font-semibold">Mother's Name</label>
                <Input
                  type="text"
                  id="mother_name"
                  fullWidth
                  value={formValues.mother_name}
                  onChange={handleInputChange}
                />
              </div>

              {/* NHTS-PR Section */}
              <h2 className="text-xl font-bold mt-6">NHTS-PR Information</h2>
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

              {/* Indigenous People */}
              <div className="flex items-center space-x-2 mt-4">
                <label htmlFor="indigenous_people" className="font-semibold">Indigenous People</label>
                <Checkbox
                  id="indigenous_people"
                  isSelected={isIndigenous}
                  onValueChange={handleCheckboxChange}
                />
              </div>
              {isIndigenous && (
                <div className="flex flex-col space-y-2 mt-2">
                  <label htmlFor="ethnic_group" className="font-semibold">Specify Ethnic Group</label>
                  <Input
                    id="ethnic_group"
                    fullWidth
                    value={formValues.ethnic_group}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {/* Client Name */}
              <h2 className="text-xl font-bold mt-6">Client Name</h2>
              <div className="mt-2">
                <Input
                  label="Full Name"
                  fullWidth
                  value={clientName}
                  readOnly
                />
              </div>

              {/* Complete Address */}
              <h2 className="text-xl font-bold mt-6">Complete Address</h2>
              <div className="mt-2">
                <Input
                  label="Full Address"
                  fullWidth
                  value={clientAddress}
                  readOnly
                />
              </div>

              {/* Nutrition Information Section */}
              <h2 className="text-xl font-bold mt-6">Nutrition Information</h2>
              {ageGroups.map((ageGroup, index) => (
                <div key={index} className="mt-4 p-4 border rounded-md">
                  <h3 className="text-lg font-semibold">{ageGroup}</h3>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex-1">
                      <Input
                        label="Weight (kg)"
                        type="number"
                        fullWidth
                        value={formValues.nutrition_info[ageGroup]?.weight || ''}
                        onChange={(e) => handleNutritionInfoChange(ageGroup, 'weight', e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        label="Height (cm)"
                        type="number"
                        fullWidth
                        value={formValues.nutrition_info[ageGroup]?.height || ''}
                        onChange={(e) => handleNutritionInfoChange(ageGroup, 'height', e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        label="BMI"
                        type="number"
                        fullWidth
                        value={formValues.nutrition_info[ageGroup]?.bmi || ''}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex-1">
                      <Input
                        label="Nutritional Status"
                        fullWidth
                        value={formValues.nutrition_info[ageGroup]?.nutritional_status || ''}
                        readOnly
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        label="Date of Measurement"
                        type="date"
                        fullWidth
                        value={formValues.nutrition_info[ageGroup]?.date_of_measurement || ''}
                        onChange={(e) => handleNutritionInfoChange(ageGroup, 'date_of_measurement', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Micronutrient Supplementation */}
                  <div className="mt-4">
                    <h4 className="text-md font-semibold">Micronutrient Supplementation</h4>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <div className="flex-1">
                        <Input
                          label="Vitamin A - Date Given"
                          type="date"
                          fullWidth
                          value={formValues.nutrition_info[ageGroup]?.vitamin_a_date1 || ''}
                          onChange={(e) => handleNutritionInfoChange(ageGroup, 'vitamin_a_date1', e.target.value)}
                        />
                      </div>
                      {/* Conditionally render the second Vitamin A dose */}
                      {ageGroup !== "6-11 months old" && (
                        <div className="flex-1">
                          <Input
                            label="Vitamin A - Date Given (Second Dose)"
                            type="date"
                            fullWidth
                            value={formValues.nutrition_info[ageGroup]?.vitamin_a_date2 || ''}
                            onChange={(e) => handleNutritionInfoChange(ageGroup, 'vitamin_a_date2', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Deworming */}
                  {ageGroup !== "6-11 months old" && (
                    <div className="mt-4">
                      <h4 className="text-md font-semibold">Deworming</h4>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <div className="flex-1">
                          <Input
                            label="1st Dose - Date Given"
                            type="date"
                            fullWidth
                            value={formValues.nutrition_info[ageGroup]?.deworming_dose1_date || ''}
                            onChange={(e) => handleNutritionInfoChange(ageGroup, 'deworming_dose1_date', e.target.value)}
                          />
                        </div>
                        <div className="flex-1">
                          <Input
                            label="2nd Dose - Date Given"
                            type="date"
                            fullWidth
                            value={formValues.nutrition_info[ageGroup]?.deworming_dose2_date || ''}
                            onChange={(e) => handleNutritionInfoChange(ageGroup, 'deworming_dose2_date', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Remarks */}
              <div className="flex flex-col space-y-2 mt-6">
                <label htmlFor="remarks" className="font-semibold">Remarks</label>
                <Textarea
                  id="remarks"
                  fullWidth
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
