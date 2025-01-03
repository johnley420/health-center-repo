import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Tabs,
  Tab,
} from "@nextui-org/react";
import React, { useState } from "react";

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

type propsTypes = {
  isOpen: boolean;
  onClose: () => void;
  data: any;
};

// Mapping the medication type to the corresponding form component
const formComponents: { [key: string]: React.ElementType } = {
  "PRENATAL & POSPARTUM CARE": PrenatalForm,
  "PERSON WITH DISABILITY (PWD)": PersonWithDisabilityForm,
  "WRA (15-49 YEARS OLD) FAMILY PLANNING": WRAForm,
  "HYPERTENSIVE AND TYPE 2 DIABETES MELITUS": HypertensiveForm,
  "10-19 YEARS OLD (ADOLESCENTS)": TentoNineteenForm,
  "0-59 MONTHS OLD CHILDREN - NUTRITION SERVICES": ZEROTO9CHILDMONTHFORM,
  "SENIOR CITIZEN(60 YEARS OLD ABOVE)": SeniorCitizenForm,
  "FILARIASIS PROGRAM SERVICES": FilariasisForm,
  "5-9 YEARS OLD CHILDREN (SCHOOL AGED CHILDREN)": FIVETO9CHILDRENFORM,
  "0-11 MONTHS OLD INFANTS - IMMUNIZATION SERVICES": Zeroto11Form,
  "SCHISTOSOMIASIS PROGRAM SERVICES": SchistosomiasisForm,
  "CURRENT SMOKERS": CurrentSmokerForm,
  "0-59 YEARS OLD SCREENED FOR VISUAL ACTIVITY": ZEROTO59MONTHFORM,
};

const ViewClientInfo = ({ isOpen, onClose, data }: propsTypes) => {
  const [tab, setTab] = useState(0);

  // client info
  const clientInfo = [
    { label: "Name", value: data.name },
    { label: "Address", value: data.address },
    { label: "Phone No.", value: data.phone },
    { label: "Birthday", value: data.birth },
    { label: "Philhealth Id", value: data.philhealthId },
    { label: "Date of Registered", value: data.dateRegistered },
  ];

  return (
    <div>
      <Modal
        scrollBehavior="outside"
        size="5xl"
        isOpen={isOpen}
        onOpenChange={onClose}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                View Information
              </ModalHeader>
              <ModalBody className="flex flex-col items-center justify-start gap-4 py-3 px-8">
                <h1 className="text-2xl font-bold pl-3">Client's Information</h1>

                {/* Tabs for Client Information and Forms */}
                <Tabs
                  aria-label="Client Forms"
                  selectedKey={String(tab)}
                  onSelectionChange={(key) => setTab(Number(key))}
                >
                  {/* Initial tab for Client Information */}
                  <Tab title="Client Information" className="w-full px-4" key="0">
                    <div className="w-full py-3">
                      <h2 className="text-lg font-semibold">Client's Information</h2>
                      <div className="w-full flex flex-col items-start justify-start">
                        {clientInfo.map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center justify-between w-full py-2"
                          >
                            <p className="font-semibold">{item.label}:</p>
                            <p>{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Tab>

                  {/* Dynamically generated tabs for forms */}
                  {data.forms.map((form: string, index: number) => (
                    <Tab key={index + 1} title={form}>
                      <div className="w-full py-3">
                        <h2 className="text-lg font-semibold">{form} Form Details</h2>
                        {/* Check if form exists in the formComponents mapping */}
                        {formComponents[form] ? (
                          React.createElement(formComponents[form], {
                            formData: data.medicationForm, // Pass form data
                          })
                        ) : (
                          <p>{`No form available for ${form}`}</p>
                        )}
                      </div>
                    </Tab>
                  ))}
                </Tabs>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ViewClientInfo;
