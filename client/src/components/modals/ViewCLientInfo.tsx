import {
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import React from "react";

type propsTypes = {
  isOpen: boolean;
  onClose: () => void;
  data: any;
};
const ViewCLientInfo = ({ isOpen, onClose, data }: propsTypes) => {
  // client info
  const clientInfo = [
    {
      label: "Name",
      value: data.name,
    },
    {
      label: "Address",
      value: data.address,
    },
    {
      label: "Phone No.",
      value: data.phone,
    },
    {
      label: "Birthday",
      value: data.birth,
    },
    {
      label: "Philhealth Id",
      value: data.philhealthId,
    },
    {
      label: "Date of Registered",
      value: data.dateRegistered,
    },
  ];

  console.log("s", clientInfo);

  return (
    <div>
      <Modal
        scrollBehavior="outside"
        size="xl"
        isOpen={isOpen}
        onOpenChange={onClose}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                View Information
              </ModalHeader>
              <ModalBody className="flex flex-col items-center justify-center gap-4 py-3">
                <h1 className="text-2xl font-bold pl-3">
                  Client's Information
                </h1>
                <div className="w-full flex flex-col items-start justify-center">
                  {clientInfo.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between w-full py-3"
                    >
                      <p className=" font-semibold">{item.label}:</p>
                      <p>{item.value}</p>
                    </div>
                  ))}
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ViewCLientInfo;
