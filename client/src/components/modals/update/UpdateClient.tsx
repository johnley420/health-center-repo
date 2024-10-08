import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
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

type propsType = {
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

const UpdateClient = ({ isOpen, onClose, data }: propsType) => {
  const [tab, setTab] = useState(0);

  const [clientInfos, setClientInfos] = useState({
    name: data?.name || "", 
    address: data?.address || "", 
    birth: data?.birth || "", 
    philhealthId: data?.philhealthId || "", 
    dateRegistered: data?.dateRegistered || "", 
  });

  // Handler to update client info fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientInfos((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Client info fields
  const clientInfo = [
    { label: "Name", value: data?.name, key: "name" },
    { label: "Address", value: data?.address, key: "address" },
    { label: "Birthdate", value: data?.birth, key: "birth" },
    { label: "Philhealth ID", value: data?.philhealthId, key: "philhealthId" },
    { label: "Date Registered", value: data?.dateRegistered, key: "dateRegistered" },
  ];

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="5xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Update Client
            </ModalHeader>
            <ModalBody className="overflow-y-auto" style={{ maxHeight: "70vh" }}>
              <Tabs
                aria-label="Client Forms"
                selectedIndex={tab}
                onChange={setTab}
              >
                {/* Initial Tab for Client Information */}
                <Tab title="Client Information">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Name"
                      name="name"
                      value={clientInfos.name}
                      onChange={handleInputChange}  
                    />
                    <Input
                      label="Address"
                      name="address"
                      value={clientInfos.address}
                      onChange={handleInputChange} 
                    />
                    <Input
                      label="Birthdate"
                      name="birth"
                      value={clientInfos.birth}
                      onChange={handleInputChange}
                    />
                    <Input
                      label="Philhealth ID"
                      name="philhealthId"
                      value={clientInfos.philhealthId}
                      onChange={handleInputChange} 
                    />
                    <Input
                      label="Date Registered"
                      name="dateRegistered"
                      value={clientInfos.dateRegistered}
                      onChange={handleInputChange} 
                    />
                  </div>
                </Tab>

                {/* Dynamically generated tabs for each form the client has */}
                {data.forms?.map((form: string, index: number) => (
                  <Tab key={index} title={form}>
                    <div className="py-4">
                      <h2 className="text-lg font-semibold">{form} Form Details</h2>
                      {/* Dynamically render form component based on form type */}
                      {formComponents[form] ? (
                        React.createElement(formComponents[form], {
                          formData: data?.medicationForm, // Pass form-specific data here
                        })
                      ) : (
                        <p>{`No form available for ${form}`}</p>
                      )}
                    </div>
                  </Tab>
                ))}
              </Tabs>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={onClose}>
                Update
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default UpdateClient;
