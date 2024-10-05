import {
  Button,
  DatePicker,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@nextui-org/react";
import React from "react";
import { categories } from "../../../constants";

type propsType = {
  isOpen: boolean;
  onClose: () => void;
};
const AddClient = ({ isOpen, onClose }: propsType) => {
  categories;
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
                <div className="col-span-2">
                  <Select label="Select Category" className="max-w-xs">
                    {categories.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <Input
                  type="text"
                  label={<span className="capitalize">Address</span>}
                />
                <Input
                  type="text"
                  label={<span className="capitalize">Phone No.</span>}
                />
                <Input
                  type="text"
                  label={<span className="capitalize">Birthday</span>}
                />
                <Input
                  type="text"
                  label={<span className="capitalize">Philhealth Id</span>}
                />
                <Input
                  type="text"
                  label={<span className="capitalize">Date Of Registered</span>}
                />
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
