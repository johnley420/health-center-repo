import { Modal, Button, ModalHeader, ModalBody, ModalFooter, ModalContent } from '@nextui-org/react';
import React from "react";

interface DeleteMedicineConfirmProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteMedicineConfirm: React.FC<DeleteMedicineConfirmProps> = ({ visible, onClose, onConfirm }) => {
  return (
    <Modal isOpen={visible} onClose={onClose}>
      <ModalContent>
        {(onClose) =>(
            <>
            <ModalHeader>
        <h3>Confirm Deletion</h3>
      </ModalHeader>
      <ModalBody>
        <p>Are you sure you want to delete this medicine?</p>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm}>Delete</Button>
      </ModalFooter>
            </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DeleteMedicineConfirm;
