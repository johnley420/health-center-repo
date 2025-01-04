import Swal from "sweetalert2"; // Import SweetAlert2
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
import React, { useState, useEffect } from "react";
import axios from "axios";

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
  Zeroto11Form,
} from "../forms";

type propsType = {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  onUpdate: () => void;
};

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

const UpdateClient = ({ isOpen, onClose, data, onUpdate }: propsType) => {
  const [tab, setTab] = useState("0");
  const [clientInfos, setClientInfos] = useState({
    fname: "",
    address: "",
    phone_no: "",
    phil_id: "",
    date_registered: "",
    category_name: "",
    gender: "",
    birthdate: "",
  });

  useEffect(() => {
    if (data) {
      setClientInfos({
        fname: data.fname || "",
        address: data.address || "",
        phone_no: data.phone_no || "",
        phil_id: data.phil_id || "",
        date_registered: data.date_registered || "",
        category_name: data.category_name || "",
        gender: data.gender || "",
        birthdate: data.birthdate ? new Date(data.birthdate).toISOString().split('T')[0] : "",
      });
    }
  }, [data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientInfos((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    try {
      await axios.post(`https://https://health-center-repo-production.up.railway.app/update-client`, {
        id: data.id,
        ...clientInfos,
      });
      onUpdate();
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Client information has been successfully updated.",
        confirmButtonColor: "#3085d6",
      });
      onClose();
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="5xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Update Client</ModalHeader>
            <ModalBody className="overflow-y-auto" style={{ maxHeight: "70vh" }}>
              <Tabs
                aria-label="Client Forms"
                selectedKey={tab}
                onSelectionChange={(key) => setTab(key.toString())}
              >
                <Tab key="0" title="Client Information" onClick={() => setTab("0")}>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      name="fname"
                      value={clientInfos.fname}
                      onChange={handleInputChange}
                    />
                    <Input
                      label="Address"
                      name="address"
                      value={clientInfos.address}
                      onChange={handleInputChange}
                    />
                    <Input
                      label="Phone Number"
                      name="phone_no"
                      value={clientInfos.phone_no}
                      onChange={handleInputChange}
                    />
                    <Input
                      label="Philhealth ID"
                      name="phil_id"
                      value={clientInfos.phil_id}
                      onChange={handleInputChange}
                    />
                    <Input
                      label="Date Registered"
                      name="date_registered"
                      value={clientInfos.date_registered}
                      onChange={handleInputChange}
                    />
                    <Input
                      label="Category Name"
                      name="category_name"
                      value={clientInfos.category_name}
                      onChange={handleInputChange}
                    />
                    <Input
                      label="Gender"
                      name="gender"
                      value={clientInfos.gender}
                      onChange={handleInputChange}
                    />
                    <Input
                      type="date"
                      label="Birthdate"
                      name="birthdate"
                      value={clientInfos.birthdate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </Tab>

                {data.forms?.map((form: string, index: number) => (
                  <Tab key={(index + 1).toString()} title={form} onClick={() => setTab((index + 1).toString())}>
                    <div className="py-4">
                      <h2 className="text-lg font-semibold">{form} Form Details</h2>
                      {formComponents[form] ? (
                        React.createElement(formComponents[form], {
                          formData: data?.medicationForm,
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
              <Button color="primary" onPress={handleUpdate}>
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
