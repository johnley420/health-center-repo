/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import React from 'react';
import { 
  ZEROTO59MONTHFORM,
  ZEROTO9CHILDMONTHFORM,
  FIVETO9CHILDRENFORM,
  SeniorCitizenForm,
  SchistosomiasisForm,
  PrenatalForm,
  PersonWithDisabilityForm,
  HypertensiveForm,
  FilariasisForm,
  CurrentSmokerForm,
  TentoNineteenForm,
  WRAForm,
  Zeroto11Form
} from "../forms";

// Mapping the medication type to the corresponding form component
const formComponents: { [key: string]: React.ElementType } = {
  "PRENATAL & POSTPARTUM CARE": PrenatalForm,
  "PERSON WITH DISABILITY (PWD)": PersonWithDisabilityForm,
  "WRA (15-49 YEARS OLD) FAMILY PLANNING": WRAForm,
  "HYPERTENSIVE AND TYPE 2 DIABETES MELITUS": HypertensiveForm,
  "10-19 YEARS OLD (ADOLESCENTS)": TentoNineteenForm,
  "0-59 MONTHS OLD CHILDREN - NUTRITION SERVICES": ZEROTO9CHILDMONTHFORM,
  "SENIOR CITIZEN (60 YEARS OLD ABOVE)": SeniorCitizenForm,
  "FILARIASIS PROGRAM SERVICES": FilariasisForm,
  "5-9 YEARS OLD CHILDREN (SCHOOL AGED CHILDREN)": FIVETO9CHILDRENFORM,
  "0-11 MONTHS OLD INFANTS - IMMUNIZATION SERVICES": Zeroto11Form,
  "SCHISTOSOMIASIS PROGRAM SERVICES": SchistosomiasisForm,
  "CURRENT SMOKERS": CurrentSmokerForm,
  "0-59 YEARS OLD SCREENED FOR VISUAL ACTIVITY": ZEROTO59MONTHFORM,
};

type PropsTypes = {
  isOpen: boolean;
  onClose: () => void;
  medicationType: string;
  data: any;
};

const ViewMedicationForm = ({
  isOpen,
  onClose,
  medicationType,
  data,
}: PropsTypes) => {
  // Log the medication type to check if it matches expected values
  console.log("Medication Type:", medicationType);

  // Determine the appropriate form component based on medicationType
  const FormComponent = formComponents[medicationType];

  return (
    <div>
      <Modal
        scrollBehavior="outside"
        size="5xl"
        isOpen={isOpen}
        onOpenChange={onClose}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {medicationType}
              </ModalHeader>
              <ModalBody className="flex flex-col items-center justify-center gap-4 py-3">
                {FormComponent ? (
                  <FormComponent data={data} /> // Pass selected client data to the form
                ) : (
                  <p>No form available for this medication type.</p>
                )}
              </ModalBody>
              <ModalFooter>
                <Button onClick={onClose}>Close</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ViewMedicationForm;
