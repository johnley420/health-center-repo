import React, { useState } from "react";
import {
  Modal,
  Input,
  Button,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalContent,
  Select,
  SelectItem,
} from "@nextui-org/react";
import Swal from "sweetalert2"; // <-- Import SweetAlert2
import { Medicine } from "../../../types";

interface AddMedicineModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (medicine: Omit<Medicine, "id">) => void;
}

// Define your categories array:
const categories = [
  "Pregnant",
  "Person With Disabilities",
  "Schistomiasis Program Services",
  "Senior Citizen",
  "WRA Family Planning",
  "Hypertensive And Type 2 Diabetes",
  "Filariasis Program Services",
  "Current Smokers",
  "0-11 Months Old Infants",
  "0-59 Months Old Children",
  "0-59 years Old Screened For Visual Activity",
  "5-9 years Old Children (School Aged Children)",
  "10-19 Years Old (Adolescents)",
];

const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("0"); // user input as string
  const [expirationDate, setExpirationDate] = useState("");
  const [image, setImage] = useState<File | null>(null);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  // Form submission
  const handleSubmit = () => {
    // Basic validation
    if (
      !name.trim() ||
      !category.trim() ||
      Number(quantity) <= 0 ||
      !expirationDate ||
      !image
    ) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "All fields are required, including a valid quantity and image!",
      });
      return;
    }

    // Construct the new medicine object
    const newMedicine = {
      name,
      category,
      quantity, // convert string to number
      expirationDate,
      image,
    };

    // Call the parent's onAdd method
    onAdd(newMedicine);

    // Show success message
    Swal.fire({
      icon: "success",
      title: "Success",
      text: "New medicine added successfully!",
    });

    // Reset fields
    setName("");
    setCategory("");
    setQuantity("0");
    setExpirationDate("");
    setImage(null);

    onClose();
  };

  return (
    <Modal scrollBehavior="outside" size="5xl" isOpen={visible} onClose={onClose}>
      <ModalContent>
        {() => (
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

              {/* Select for Category */}
              <Select
                label="Select Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </Select>

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
              <Button color="danger" onPress={onClose}>
                Cancel
              </Button>
              <Button onPress={handleSubmit}>Add Medicine</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddMedicineModal;
