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
  data: any;
};
const UpdateClient = ({ isOpen, onClose, data }: propsType) => {
  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onClose} size="3xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Update Client
              </ModalHeader>
              <ModalBody className="grid grid-cols-2 gap-4">
                <Input label="Name" value={data?.name} />
                <Input label="Name" value={data?.address} />
                <Input label="Name" value={data?.birth} />
                <Input label="Name" value={data?.philhealthId} />
                <Input label="Name" value={data?.dateRegistered} />
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
    </>
  );
};

export default UpdateClient;
