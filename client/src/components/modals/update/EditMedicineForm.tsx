/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import React from "react";
import { Modal, Input, Button, ModalHeader, ModalBody, ModalFooter, ModalContent } from '@nextui-org/react';
import { Medicine } from '../../types';

interface EditMedicineModalProps {
  medicine: Medicine | null;
  visible: boolean;
  onClose: () => void;
  onUpdate: (medicine: Medicine) => void;
}


const EditMedicineModal: React.FC<EditMedicineModalProps> = ({
  medicine,
  visible,
  onClose,
  onUpdate,
}) => {
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('0');
  const [expirationDate, setExpirationDate] = useState<string>('');
  const [image, setImage] = useState<any>('');

  // Set the initial state when the medicine prop changes
  useEffect(() => {
    if (medicine) {
      setName(medicine.name);
      setCategory(medicine.category);
      setQuantity(medicine.quantity);
      setExpirationDate(medicine.expirationDate);
      setImage(medicine.image); // Update image if it was already provided
    }
  }, [medicine]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!name || !category || Number(quantity) <= 0 || !expirationDate) {
      alert('All fields are required!');
      return;
    }

    const updatedMedicine: Medicine = {
      id: medicine ? medicine.id : Date.now(),
      name,
      category,
      quantity,
      expirationDate,
      image,
    };

    onUpdate(updatedMedicine);
    onClose();
  };

  return (
    <Modal isOpen={visible} onClose={onClose}>
      <ModalContent>
        {(onClose) =>(
            <>
            <ModalHeader>
        <h3>Edit Medicine</h3>
      </ModalHeader>
      <ModalBody>
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <Input
          label="Quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
        <Input
          label="Expiration Date"
          type="date"
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
          required
        />
        <Input
          label="Upload Image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          Update Medicine
        </Button>
      </ModalFooter>
            </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EditMedicineModal;
