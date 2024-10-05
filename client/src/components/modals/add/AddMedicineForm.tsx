import { useState } from "react";
import React from "react";
import {
  Modal,
  Input,
  Button,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalContent,
} from "@nextui-org/react";

interface AddMedicineModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (medicine: Medicine) => void;
}

interface Medicine {
  id: number;
  name: string;
  category: string;
  quantity: string;
  expirationDate: string;
  image: File | null;
}

const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [quantity, setQuantity] = useState<string>('0');
  const [expirationDate, setExpirationDate] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!name || !category || Number(quantity) <= 0 || !expirationDate || !image) {
      alert("All fields are required, including the image!");
      return;
    }

    const newMedicine: Medicine = {
      id: Date.now(),
      name,
      category,
      quantity,
      expirationDate,
      image,
    };

    onAdd(newMedicine);

    // Reset fields after adding
    setName("");
    setCategory("");
    setQuantity("0");
    setExpirationDate("");
    setImage(null);
    onClose();
  };

  return (
    <Modal
      scrollBehavior="outside"
      size="5xl"
      isOpen={visible}
      onClose={onClose}
    >
     <ModalContent>
     {(onClose) =>(
        <>
         <ModalHeader>
        <h3>Add New Medicine</h3>
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
          required
        />
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Add Medicine</Button>
      </ModalFooter>
        </>
     )}
     </ModalContent>
    </Modal>
  );
};

export default AddMedicineModal;
