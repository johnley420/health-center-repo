// src/components/modals/forms/pregnant/PrenatalForm.tsx

import React, { useState, useEffect } from 'react';
import {
  Button,
  Checkbox,
  Input,
  Select,
  SelectItem,
  Switch,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';
import axios from 'axios';

// Define specific types for nested objects
type PrenatalVisits = {
  visit1: string;
  visit2: string;
  visit3: string;
  visit4: string;
};

type NextPrenatalVisits = {
  next_visit1: string;
  next_visit2: string;
  next_visit3: string;
  next_visit4: string;
};

type TdImmunizations = {
  previous: string;
  current: string;
};

type LaboratoryExaminations = {
  hemoglobin: string;
  blood_typing: string;
  urinalysis: string;
  other_examinations: string;
};

type MicronutrientSupplementation = {
  iron_with_mms_date: string;
  iron_with_mms_tablets: string;
  calcium_carbonate_date: string;
  calcium_carbonate_tablets: string;
  iodine_date: string;
  iodine_tablets: string;
  deworming_date: string;
  deworming_tablets: string;
};

type PostpartumCareVisits = {
  first_visit: string;
  second_visit: string;
};

// Define a union type for nested fields
type NestedFields =
  | 'prenatal_visits'
  | 'next_prenatal_visits'
  | 'postpartum_care_visits'
  | 'laboratory_examinations'
  | 'micronutrient_supplementation'
  | 'td_immunizations';

// FormValuesType includes all form fields
type FormValuesType = {
  worker_id: string;
  client_id: number | '';
  indigenous_people: boolean;
  ethnic_group: string;
  gravida: boolean;
  parity: boolean;
  abortion: boolean;
  stillbirth: boolean;
  height: string;
  weight: string;
  bmi: string;
  nutritional_status: string;
  nhts_pr_id: string;
  cct_id_number: string;
  phic_id_number: string;
  expected_date_of_confinement: string;
  prenatal_visits: PrenatalVisits;
  next_prenatal_visits: NextPrenatalVisits;
  risk_codes: string;
  seen_by: string;
  with_birth_plan: boolean;
  td_immunizations: TdImmunizations;
  laboratory_examinations: LaboratoryExaminations;
  micronutrient_supplementation: MicronutrientSupplementation;
  quality_prenatal_care: string;
  date_of_delivery: string;
  type_of_delivery: string;
  weeks_of_pregnancy: string;
  outcome_of_delivery: string;
  date_breastfeeding_initiated: string;
  postpartum_care_visits: PostpartumCareVisits;
  family_planning: string;
  referred_to_facility: string;
};

// Props interface for PrenatalForm component
interface PrenatalFormProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  selectedData: any;
}

export const PrenatalForm: React.FC<PrenatalFormProps> = ({
  isOpen,
  onClose,
  data,
  selectedData,
}) => {
  const [formValues, setFormValues] = useState<FormValuesType>({
    worker_id: sessionStorage.getItem('id') || '',
    client_id: data?.id || '',
    indigenous_people: false,
    ethnic_group: '',
    gravida: false,
    parity: false,
    abortion: false,
    stillbirth: false,
    height: '',
    weight: '',
    bmi: '',
    nutritional_status: '',
    nhts_pr_id: '',
    cct_id_number: '',
    phic_id_number: '',
    expected_date_of_confinement: '',
    prenatal_visits: {
      visit1: '',
      visit2: '',
      visit3: '',
      visit4: '',
    },
    next_prenatal_visits: {
      next_visit1: '',
      next_visit2: '',
      next_visit3: '',
      next_visit4: '',
    },
    risk_codes: '',
    seen_by: '',
    with_birth_plan: false,
    td_immunizations: {
      previous: '',
      current: '',
    },
    laboratory_examinations: {
      hemoglobin: '',
      blood_typing: '',
      urinalysis: '',
      other_examinations: '',
    },
    micronutrient_supplementation: {
      iron_with_mms_date: '',
      iron_with_mms_tablets: '',
      calcium_carbonate_date: '',
      calcium_carbonate_tablets: '',
      iodine_date: '',
      iodine_tablets: '',
      deworming_date: '',
      deworming_tablets: '',
    },
    quality_prenatal_care: '',
    date_of_delivery: '',
    type_of_delivery: '',
    weeks_of_pregnancy: '',
    outcome_of_delivery: '',
    date_breastfeeding_initiated: '',
    postpartum_care_visits: {
      first_visit: '',
      second_visit: '',
    },
    family_planning: '',
    referred_to_facility: '',
  });

  const [clientName, setClientName] = useState<string>(data?.fname || '');
  const [clientAddress, setClientAddress] = useState<string>(data?.address || '');
  const [isIndigenous, setIsIndigenous] = useState<boolean>(false);

  useEffect(() => {
    if (selectedData) {
      console.log('Selected Data:', selectedData);

      // Parse nested JSON fields if they are strings
      const parsedData = {
        ...selectedData,
        prenatal_visits:
          typeof selectedData.prenatal_visits === 'string'
            ? JSON.parse(selectedData.prenatal_visits)
            : selectedData.prenatal_visits,
        next_prenatal_visits:
          typeof selectedData.next_prenatal_visits === 'string'
            ? JSON.parse(selectedData.next_prenatal_visits)
            : selectedData.next_prenatal_visits,
        laboratory_examinations:
          typeof selectedData.laboratory_examinations === 'string'
            ? JSON.parse(selectedData.laboratory_examinations)
            : selectedData.laboratory_examinations,
        micronutrient_supplementation:
          typeof selectedData.micronutrient_supplementation === 'string'
            ? JSON.parse(selectedData.micronutrient_supplementation)
            : selectedData.micronutrient_supplementation,
        td_immunizations:
          typeof selectedData.td_immunizations === 'string'
            ? JSON.parse(selectedData.td_immunizations)
            : selectedData.td_immunizations,
        postpartum_care_visits:
          typeof selectedData.postpartum_care_visits === 'string'
            ? JSON.parse(selectedData.postpartum_care_visits)
            : selectedData.postpartum_care_visits,
      };

      setFormValues({
        ...parsedData,
        worker_id: parsedData.worker_id || sessionStorage.getItem('id') || '',
        client_id: parsedData.client_id || data?.id || '',
      });

      setIsIndigenous(parsedData.indigenous_people === 1);

      console.log('Parsed Data:', parsedData);

      // Fetch client name and address using client_id
      fetchClientDetails(parsedData.client_id);
    } else {
      // Fetch client name and address using client_id
      fetchClientDetails(data?.id || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedData, data]);

  const fetchClientDetails = async (clientId: number) => {
    if (!clientId || isNaN(clientId)) {
      console.error('Invalid clientId:', clientId);
      return;
    }

    console.log('Fetching client details for clientId:', clientId);

    try {
      const response = await axios.get(`https://health-center-repo-production.up.railway.app/clients/${clientId}`);
      if (response.status === 200) {
        const clientData = response.data;
        setClientName(clientData.fname);
        setClientAddress(clientData.address);
      }
    } catch (error: any) {
      if (error.response) {
        console.error('Error fetching client details:', error.response.data);
      } else if (error.request) {
        console.error('Error fetching client details: No response received');
      } else {
        console.error('Error fetching client details:', error.message);
      }
    }
  };

  // Type Guard to ensure the parent key is a NestedField
  const isNestedField = (field: string): field is NestedFields => {
    return [
      'prenatal_visits',
      'next_prenatal_visits',
      'postpartum_care_visits',
      'laboratory_examinations',
      'micronutrient_supplementation',
      'td_immunizations',
    ].includes(field);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;

    // Handle nested fields
    if (id.includes('.')) {
      const [parent, child] = id.split('.');

      if (isNestedField(parent)) {
        setFormValues((prevValues) => ({
          ...prevValues,
          [parent]: {
            ...prevValues[parent],
            [child]: value,
          },
        }));
      } else {
        console.warn(`Unhandled parent field: ${parent}`);
      }
    } else {
      setFormValues({ ...formValues, [id]: value });

      // Automatically calculate BMI when height or weight changes
      if (id === 'height' || id === 'weight') {
        const heightCm = parseFloat(id === 'height' ? value : formValues.height);
        const weightKg = parseFloat(id === 'weight' ? value : formValues.weight);

        if (heightCm > 0 && weightKg > 0) {
          const heightM = heightCm / 100;
          const bmi = weightKg / (heightM * heightM);
          const roundedBMI = bmi.toFixed(2);
          let nutritionalStatus = '';

          // Determine nutritional status based on BMI
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
            bmi: roundedBMI,
            nutritional_status: nutritionalStatus,
          }));
        } else {
          // If weight or height is invalid, clear BMI and nutritional status
          setFormValues((prevValues) => ({
            ...prevValues,
            bmi: '',
            nutritional_status: '',
          }));
        }
      }
    }
  };

  const handleCheckboxChange = (id: keyof FormValuesType, value: boolean) => {
    setFormValues({ ...formValues, [id]: value });

    if (id === 'indigenous_people') {
      setIsIndigenous(value);
      if (!value) {
        setFormValues((prevValues) => ({
          ...prevValues,
          ethnic_group: '',
        }));
      }
    }
  };

  const handleSubmit = async () => {
    try {
      console.log('Submitting formValues:', formValues);

      // Prepare data before sending
      const preparedFormValues = {
        ...formValues,
        indigenous_people: formValues.indigenous_people ? 1 : 0,
        gravida: formValues.gravida ? 1 : 0,
        parity: formValues.parity ? 1 : 0,
        abortion: formValues.abortion ? 1 : 0,
        stillbirth: formValues.stillbirth ? 1 : 0,
        with_birth_plan: formValues.with_birth_plan ? 1 : 0,
        client_id: Number(formValues.client_id),
        height: formValues.height ? Number(formValues.height).toString() : '',
        weight: formValues.weight ? Number(formValues.weight).toString() : '',
        bmi: formValues.bmi ? Number(formValues.bmi).toString() : '',
      };

      let successMessage = '';

      if (selectedData && selectedData.id) {
        // Update existing data
        const response = await axios.put(
          `https://health-center-repo-production.up.railway.app/pregnant/${selectedData.id}`,
          preparedFormValues,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        successMessage = response.data.message || 'Data updated successfully!';
        console.log('Data updated successfully:', response.data);
      } else {
        // Create new data
        const response = await axios.post(
          'https://health-center-repo-production.up.railway.app/pregnant',
          preparedFormValues,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        successMessage = response.data.message || 'Data submitted successfully!';
        console.log('Data submitted successfully:', response.data);
      }

      alert(successMessage);
      onClose();
    } catch (error: any) {
      console.error('Error submitting data:', error);
      alert(
        `An error occurred while submitting data: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside" size="2xl">
      <ModalContent>
        <ModalHeader>
          {selectedData ? 'Edit Prenatal Data' : 'Add Prenatal Data'}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* Client Name */}
            <h2 className="text-lg font-semibold">Client Name</h2>
            <div>
              <Input label="FULL NAME" fullWidth readOnly value={clientName} />
            </div>

            {/* Complete Address */}
            <h2 className="text-lg font-semibold">Complete Address</h2>
            <div>
              <Input label="COMPLETE ADDRESS" fullWidth readOnly value={clientAddress} />
            </div>

            {/* Indigenous People Checkbox */}
            <div className="flex items-center gap-2">
              <p>Indigenous People</p>
              <Checkbox
                isSelected={formValues.indigenous_people}
                onValueChange={(value) => handleCheckboxChange('indigenous_people', value)}
              />
            </div>

            {/* Ethnic Group Field - Conditionally Rendered */}
            {isIndigenous && (
              <div className="mb-4">
                <Input
                  label="Specify Ethnic Group"
                  id="ethnic_group"
                  value={formValues.ethnic_group}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </div>
            )}

            {/* Gravida, Parity, Abortion, StillBirth Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Checkbox
                color="primary"
                isSelected={formValues.gravida}
                onValueChange={(value) => handleCheckboxChange('gravida', value)}
              >
                Gravida
              </Checkbox>
              <Checkbox
                color="primary"
                isSelected={formValues.parity}
                onValueChange={(value) => handleCheckboxChange('parity', value)}
              >
                Parity
              </Checkbox>
              <Checkbox
                color="primary"
                isSelected={formValues.abortion}
                onValueChange={(value) => handleCheckboxChange('abortion', value)}
              >
                Abortion
              </Checkbox>
              <Checkbox
                color="primary"
                isSelected={formValues.stillbirth}
                onValueChange={(value) => handleCheckboxChange('stillbirth', value)}
              >
                StillBirth
              </Checkbox>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Height (cm)"
                type="number"
                id="height"
                value={formValues.height}
                onChange={handleInputChange}
                fullWidth
                required
              />
              <Input
                label="Weight (kg)"
                type="number"
                id="weight"
                value={formValues.weight}
                onChange={handleInputChange}
                fullWidth
                required
              />
              <Input
                label="BMI"
                type="number"
                value={formValues.bmi}
                fullWidth
                readOnly
              />
            </div>

            {/* Nutritional Status */}
            {formValues.bmi && (
              <div className="mb-4">
                <Input
                  label="Nutritional Status"
                  type="text"
                  value={formValues.nutritional_status}
                  fullWidth
                  readOnly
                />
              </div>
            )}

            {/* NHTS-PR */}
            <h2 className="text-lg font-semibold">NHTS-PR</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="NHTS-PR ID NUMBER"
                id="nhts_pr_id"
                value={formValues.nhts_pr_id}
                onChange={handleInputChange}
                fullWidth
              />
              <Input
                label="4Ps/CCT ID NUMBER"
                id="cct_id_number"
                value={formValues.cct_id_number}
                onChange={handleInputChange}
                fullWidth
              />
              <Input
                label="PHIC ID NUMBER"
                id="phic_id_number"
                value={formValues.phic_id_number}
                onChange={handleInputChange}
                fullWidth
              />
            </div>

            {/* Expected Date of Confinement */}
            <Input
              label="Expected Date of Confinement"
              type="date"
              id="expected_date_of_confinement"
              value={formValues.expected_date_of_confinement}
              onChange={handleInputChange}
              fullWidth
            />

            {/* Actual Dates of Prenatal Visits */}
            <h2 className="text-lg font-semibold">Actual Dates of Prenatal Visits</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(['visit1', 'visit2', 'visit3', 'visit4'] as const).map((visit, index) => (
                <Input
                  key={index}
                  label={`Visit ${index + 1}`}
                  type="date"
                  id={`prenatal_visits.${visit}`} // Nested field
                  value={formValues.prenatal_visits[visit]}
                  onChange={handleInputChange}
                  fullWidth
                />
              ))}
            </div>

            {/* Next Prenatal Visits */}
            <h2 className="text-lg font-semibold">Next Prenatal Visits</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(['next_visit1', 'next_visit2', 'next_visit3', 'next_visit4'] as const).map(
                (visit, index) => (
                  <Input
                    key={index}
                    label={`Next Visit ${index + 1}`}
                    type="date"
                    id={`next_prenatal_visits.${visit}`} // Nested field
                    value={formValues.next_prenatal_visits[visit]}
                    onChange={handleInputChange}
                    fullWidth
                  />
                )
              )}
            </div>

            <Input
              label="Risk Codes"
              id="risk_codes"
              value={formValues.risk_codes}
              onChange={handleInputChange}
              fullWidth
            />

            <Select
              label="Seen by"
              selectedKeys={new Set([formValues.seen_by])}
              onSelectionChange={(keys) =>
                setFormValues({ ...formValues, seen_by: Array.from(keys).join('') })
              }
              placeholder="Select"
              fullWidth
            >
              <SelectItem key="Doctor">Doctor</SelectItem>
              <SelectItem key="Dentist">Dentist</SelectItem>
              <SelectItem key="Midwife">Midwife</SelectItem>
              <SelectItem key="Nurse">Nurse</SelectItem>
            </Select>

            <div className="flex items-center">
              <label className="mr-2">With Birth Plan</label>
              <Switch
                isSelected={formValues.with_birth_plan}
                onValueChange={(value) => handleCheckboxChange('with_birth_plan', value)}
              />
            </div>

            {/* Td Immunizations */}
            <h2 className="text-lg font-semibold">Td Immunizations Dose</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Previous"
                type="date"
                id="td_immunizations.previous" // Nested field
                value={formValues.td_immunizations.previous}
                onChange={handleInputChange}
                fullWidth
              />
              <Input
                label="Current"
                type="date"
                id="td_immunizations.current" // Nested field
                value={formValues.td_immunizations.current}
                onChange={handleInputChange}
                fullWidth
              />
            </div>

            {/* Laboratory Examination */}
            <h2 className="text-lg">Laboratory Examination</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Hemoglobin"
                type="date"
                id="laboratory_examinations.hemoglobin"
                value={formValues.laboratory_examinations.hemoglobin}
                onChange={handleInputChange}
                fullWidth
              />
              <Input
                label="Blood Typing"
                type="date"
                id="laboratory_examinations.blood_typing"
                value={formValues.laboratory_examinations.blood_typing}
                onChange={handleInputChange}
                fullWidth
              />
              <Input
                label="Urinalysis"
                type="date"
                id="laboratory_examinations.urinalysis"
                value={formValues.laboratory_examinations.urinalysis}
                onChange={handleInputChange}
                fullWidth
              />
            </div>

            <Input
              label="Other Examinations"
              id="laboratory_examinations.other_examinations"
              value={formValues.laboratory_examinations.other_examinations}
              onChange={handleInputChange}
              fullWidth
            />

            {/* Micronutrient Supplementation */}
            <h2 className="text-lg">Micronutrient Supplementation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* IRON/MMS */}
              <div>
                <Input
                  label="IRON/MMS Date"
                  type="date"
                  id="micronutrient_supplementation.iron_with_mms_date"
                  value={formValues.micronutrient_supplementation.iron_with_mms_date}
                  onChange={handleInputChange}
                  fullWidth
                />
                {formValues.micronutrient_supplementation.iron_with_mms_date && (
                  <Input
                    label="Tablets"
                    type="number"
                    id="micronutrient_supplementation.iron_with_mms_tablets"
                    value={formValues.micronutrient_supplementation.iron_with_mms_tablets}
                    onChange={handleInputChange}
                    fullWidth
                  />
                )}
              </div>
              {/* CALCIUM CARBONATE */}
              <div>
                <Input
                  label="CALCIUM CARBONATE Date"
                  type="date"
                  id="micronutrient_supplementation.calcium_carbonate_date"
                  value={formValues.micronutrient_supplementation.calcium_carbonate_date}
                  onChange={handleInputChange}
                  fullWidth
                />
                {formValues.micronutrient_supplementation.calcium_carbonate_date && (
                  <Input
                    label="Tablets"
                    type="number"
                    id="micronutrient_supplementation.calcium_carbonate_tablets"
                    value={formValues.micronutrient_supplementation.calcium_carbonate_tablets}
                    onChange={handleInputChange}
                    fullWidth
                  />
                )}
              </div>
              {/* IODINE */}
              <div>
                <Input
                  label="IODINE Date"
                  type="date"
                  id="micronutrient_supplementation.iodine_date"
                  value={formValues.micronutrient_supplementation.iodine_date}
                  onChange={handleInputChange}
                  fullWidth
                />
                {formValues.micronutrient_supplementation.iodine_date && (
                  <Input
                    label="Tablets"
                    type="number"
                    id="micronutrient_supplementation.iodine_tablets"
                    value={formValues.micronutrient_supplementation.iodine_tablets}
                    onChange={handleInputChange}
                    fullWidth
                  />
                )}
              </div>
              {/* DEWORMING */}
              <div>
                <Input
                  label="DEWORMING Date"
                  type="date"
                  id="micronutrient_supplementation.deworming_date"
                  value={formValues.micronutrient_supplementation.deworming_date}
                  onChange={handleInputChange}
                  fullWidth
                />
                {formValues.micronutrient_supplementation.deworming_date && (
                  <Input
                    label="Tablets"
                    type="number"
                    id="micronutrient_supplementation.deworming_tablets"
                    value={formValues.micronutrient_supplementation.deworming_tablets}
                    onChange={handleInputChange}
                    fullWidth
                  />
                )}
              </div>
            </div>

            <Select
              label="Quality Prenatal Care"
              selectedKeys={new Set([formValues.quality_prenatal_care])}
              onSelectionChange={(keys) =>
                setFormValues({ ...formValues, quality_prenatal_care: Array.from(keys).join('') })
              }
              placeholder="Select"
              fullWidth
            >
              <SelectItem key="Yes">Yes</SelectItem>
              <SelectItem key="No">No</SelectItem>
            </Select>

            <Input
              label="Date of Delivery"
              type="date"
              id="date_of_delivery"
              value={formValues.date_of_delivery}
              onChange={handleInputChange}
              fullWidth
            />

            {/* Type of Delivery */}
            <h2 className="text-lg">Type of Delivery</h2>
            <Select
              label="Type of Delivery"
              selectedKeys={new Set([formValues.type_of_delivery])}
              onSelectionChange={(keys) =>
                setFormValues({ ...formValues, type_of_delivery: Array.from(keys).join('') })
              }
              placeholder="Select"
              fullWidth
            >
              <SelectItem key="NSVD">NSVD</SelectItem>
              <SelectItem key="AVD">AVD</SelectItem>
              <SelectItem key="C-Section">C-Section</SelectItem>
              <SelectItem key="Water Birth">Water Birth</SelectItem>
              <SelectItem key="Home Birth">Home Birth</SelectItem>
              <SelectItem key="VBAC">VBAC</SelectItem>
              <SelectItem key="Birthing Centers">Birthing Centers</SelectItem>
            </Select>

            {/* Weeks of Pregnancy */}
            <h2 className="text-lg">Weeks of Pregnancy</h2>
            <Select
              label="Weeks"
              selectedKeys={new Set([formValues.weeks_of_pregnancy])}
              onSelectionChange={(keys) =>
                setFormValues({ ...formValues, weeks_of_pregnancy: Array.from(keys).join('') })
              }
              placeholder="Select"
              fullWidth
            >
              <SelectItem key="PRETERM">PRETERM</SelectItem>
              <SelectItem key="TERM">TERM</SelectItem>
            </Select>

            {/* Outcome of Delivery */}
            <h2 className="text-lg">Outcome of Delivery</h2>
            <Select
              label="Outcome"
              selectedKeys={new Set([formValues.outcome_of_delivery])}
              onSelectionChange={(keys) =>
                setFormValues({ ...formValues, outcome_of_delivery: Array.from(keys).join('') })
              }
              placeholder="Select"
              fullWidth
            >
              <SelectItem key="LIVEBIRTH">LIVEBIRTH</SelectItem>
              <SelectItem key="STILLBIRTH">STILLBIRTH</SelectItem>
              <SelectItem key="ABORTION">ABORTION</SelectItem>
            </Select>

            {/* Breastfeeding */}
            <h2 className="text-lg">Breastfeeding</h2>
            <Input
              label="Date Breastfeeding Initiated"
              type="date"
              id="date_breastfeeding_initiated"
              value={formValues.date_breastfeeding_initiated}
              onChange={handleInputChange}
              fullWidth
            />

            {/* Postpartum Care Visits */}
            <h2 className="text-lg">Postpartum Care Visits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Postpartum Visit"
                type="date"
                id="postpartum_care_visits.first_visit" // Nested field
                value={formValues.postpartum_care_visits.first_visit}
                onChange={handleInputChange}
                fullWidth
              />
              <Input
                label="Second Postpartum Visit"
                type="date"
                id="postpartum_care_visits.second_visit" // Nested field
                value={formValues.postpartum_care_visits.second_visit}
                onChange={handleInputChange}
                fullWidth
              />
            </div>

            {/* Family Planning */}
            <h2 className="text-lg">Family Planning</h2>
            <Select
              label="Family Planning"
              selectedKeys={new Set([formValues.family_planning])}
              onSelectionChange={(keys) =>
                setFormValues({ ...formValues, family_planning: Array.from(keys).join('') })
              }
              placeholder="Select"
              fullWidth
            >
              <SelectItem key="Yes">Yes</SelectItem>
              <SelectItem key="No">No</SelectItem>
            </Select>

            {/* Referred to Facility */}
            <h2 className="text-lg">Referred to Facility</h2>
            <Select
              label="Referred to Facility"
              selectedKeys={new Set([formValues.referred_to_facility])}
              onSelectionChange={(keys) =>
                setFormValues({ ...formValues, referred_to_facility: Array.from(keys).join('') })
              }
              placeholder="Select"
              fullWidth
            >
              <SelectItem key="Yes">Yes</SelectItem>
              <SelectItem key="No">No</SelectItem>
            </Select>
          </div>
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
