import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem } from '@nextui-org/react';
import React from 'react';

type PropsTypes = {
  isOpen: boolean;
  onClose: () => void;
};

const ViewWorkerForm = ({
  isOpen,
  onClose
}: PropsTypes) => {
  return (
    <div>
      <Modal scrollBehavior="outside" size="5xl" isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                Add Worker
              </ModalHeader>
              <ModalBody>
                <form className="grid grid-cols-2 gap-4">
                  <div>
                    <Input label="First Name" placeholder="Enter first name" required />
                  </div>
                  <div>
                    <Input label="Last Name" placeholder="Enter last name" required />
                  </div>
                  <div>
                    <Input label="Birth Date" type="date" required />
                  </div>
                  <div>
                    <Input label="Age" type="number" placeholder="Enter age" required />
                  </div>
                  <div>
                    <Select label="Sex" placeholder="Select a gender" required>
                      <SelectItem key="Male" value="Male">Male</SelectItem>
                      <SelectItem key="Female" value="Female">Female</SelectItem>
                      <SelectItem key="Others" value="Others">Others</SelectItem>
                    </Select>
                  </div>
                  <div>
                    <Input label="Address" placeholder="Enter address" required />
                  </div>
                  <div>
                    <Select label="Place Assign" placeholder="Select a place" required>
                      <SelectItem key="purok1" value="purok1">Purok 1</SelectItem>
                      <SelectItem key="purok2" value="purok2">Purok 2</SelectItem>
                      <SelectItem key="purok3" value="purok3">Purok 3</SelectItem>
                      <SelectItem key="purok4" value="purok4">Purok 4</SelectItem>
                      <SelectItem key="purok5" value="purok5">Purok 5</SelectItem>
                      <SelectItem key="purok6" value="purok6">Purok 6</SelectItem>
                      <SelectItem key="purok7" value="purok7">Purok 7</SelectItem>
                      <SelectItem key="purok8" value="purok8">Purok 8</SelectItem>
                      <SelectItem key="purok9" value="purok9">Purok 9</SelectItem>
                      <SelectItem key="purok10" value="purok10">Purok 10</SelectItem>
                    </Select>
                  </div>
                  <div>
                    <Input label="Username" placeholder="Enter username" required />
                  </div>
                  <div>
                    <Input label="Password" type="password" placeholder="Enter password" required />
                  </div>
                  <div>
                    <Input label="ID Picture" type="file" required />
                  </div>
                  <div>
                    <Input label="Profile Picture" type="file" required />
                  </div>
                </form>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ViewWorkerForm;
