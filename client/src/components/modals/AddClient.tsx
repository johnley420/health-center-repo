import {
  Button,
  DatePicker,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import React from "react";

type propsType = {
  isOpen: boolean;
  onClose: () => void;
  fields?: { type: string; name: string }[];
};
const AddClient = ({ isOpen, onClose, fields }: propsType) => {
  console.log("fields", fields);

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onClose} size="3xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add Client
              </ModalHeader>
              <ModalBody className="grid grid-cols-2 gap-4">
                {fields?.map((item, index) =>
                  item.type === "text" || item.type === "number" ? (
                    <Input
                      type={item.type}
                      name={item.name}
                      label={<span className="capitalize">{item.name}</span>}
                    />
                  ) : item.type === "select" ? (
                    <>select</>
                  ) : (
                    <DatePicker
                      label={<span className="capitalize">{item.name}</span>}
                    />
                  )
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Add
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddClient;
