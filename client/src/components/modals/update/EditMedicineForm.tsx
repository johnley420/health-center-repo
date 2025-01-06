import React, { useState, useEffect } from "react";
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

interface EditMedicineModalProps {
  medicine: Medicine | null;
  visible: boolean;
  onClose: () => void;
  onUpdate: (medicine: Medicine) => void;
}

// Categories array
const categories = [
  "All",
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

const EditMedicineModal: React.FC<EditMedicineModalProps> = ({
  medicine,
  visible,
  onClose,
  onUpdate,
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [expirationDate, setExpirationDate] = useState("");
  const [image, setImage] = useState<File | string | null>(null);

  // Populate form fields when a "medicine" is selected
  useEffect(() => {
    if (medicine) {
      setName(medicine.name || "");
      setCategory(medicine.category || "");
      setQuantity(medicine.quantity?.toString() || "0");
      setExpirationDate(medicine.expirationDate || "");
      setImage(medicine.image || null);
    }
  }, [medicine]);

  // Handle file uploads
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]); // store the new file
    }
  };

  // Submit updates
  const handleSubmit = () => {
    // Check if there is a selected medicine to edit
    if (!medicine) {
      Swal.fire({
        icon: "error",
        title: "No Medicine Selected",
        text: "There is no medicine to update!",
      });
      return;
    }

    // Basic validation
    if (!name.trim() || !category.trim() || Number(quantity) <= 0 || !expirationDate) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "All fields are required, including a valid quantity!",
      });
      return;
    }

    // Build an updated medicine object
    const updatedMedicine: Medicine = {
      ...medicine, // keep the same ID
      name,
      category,
      quantity, // convert string -> number
      expirationDate,
      image, // could be the existing image filename or a new File
    };

    // Call the parent's update method
    onUpdate(updatedMedicine);

    // Show success message
    Swal.fire({
      icon: "success",
      title: "Success",
      text: "Medicine updated successfully!",
    });

    onClose();
  };

  return (
    <Modal isOpen={visible} onClose={onClose}>
      <ModalContent>
        {() => (
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
              
              {/* Category dropdown */}
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
                label="Change Image (optional)"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" onPress={onClose}>
                Cancel
              </Button>
              <Button onPress={handleSubmit}>Update Medicine</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EditMedicineModal;
