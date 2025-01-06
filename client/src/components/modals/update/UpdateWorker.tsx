import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import axios from "axios";
import Swal from "sweetalert2";

// Type definitions
type PropsType = {
  isOpen: boolean;
  onClose: () => void;
  data: {
    id: number;
    firstName: string;
    lastName: string;
    age: number;
    address: string;
    gender: string; // "gender" must match your DB column & server
    birthdate: string;
    placeAssigned: string;
    idPic: string;
    profilePic: string;
    username: string;
  };
  onUpdate: () => void;
};

const UpdateWorker: React.FC<PropsType> = ({ isOpen, onClose, data, onUpdate }) => {
  const [workerData, setWorkerData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    address: "",
    gender: "",
    birthdate: "",
    placeAssigned: "",
    username: "",
  });

  const [idPic, setIdPic] = useState<File | null>(null);
  const [profilePic, setProfilePic] = useState<File | null>(null);

  // Initialize worker data when modal opens
  useEffect(() => {
    if (data) {
      setWorkerData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        age: data.age?.toString() || "",
        address: data.address || "",
        gender: data.gender || "",
        birthdate: data.birthdate || "",
        placeAssigned: data.placeAssigned || "",
        username: data.username || "",
      });
    }
  }, [data]);

  /**
   * Helper to calculate age given a YYYY-MM-DD birthdate
   */
  const calculateAge = (birthdateStr: string): number => {
    if (!birthdateStr) return 0;
    const today = new Date();
    const birthDate = new Date(birthdateStr);
    let computedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      computedAge--;
    }
    return computedAge;
  };

  /**
   * Whenever birthdate changes, recalc the age automatically
   */
  useEffect(() => {
    if (workerData.birthdate) {
      const newAge = calculateAge(workerData.birthdate);
      setWorkerData((prevData) => ({
        ...prevData,
        age: newAge.toString(),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerData.birthdate]);

  // Handle text input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWorkerData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      if (name === "idPic") setIdPic(files[0]);
      if (name === "profilePic") setProfilePic(files[0]);
    }
  };

  // Handle update submission
  const handleUpdate = async () => {
    try {
      const formData = new FormData();

      // Append text fields
      formData.append("firstName", workerData.firstName);
      formData.append("lastName", workerData.lastName);
      formData.append("age", workerData.age);
      formData.append("address", workerData.address);
      formData.append("gender", workerData.gender);
      formData.append("birthdate", workerData.birthdate);
      formData.append("placeAssigned", workerData.placeAssigned);
      formData.append("username", workerData.username);

      // Append files if new ones selected
      if (idPic) formData.append("id_pic", idPic);
      if (profilePic) formData.append("profile_pic", profilePic);

      // Send PUT request
      const response = await axios.put(
        `http://localhost:8081/update-worker/${data.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Check response
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Worker updated successfully!",
        });
        onUpdate(); // Refresh the list
        onClose();  // Close modal
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: "Failed to update worker.",
        });
      }
    } catch (error: any) {
      console.error("Error:", error.response?.data || error.message);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "An error occurred while updating the worker.",
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="3xl">
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Update Worker
            </ModalHeader>
            <ModalBody className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                value={workerData.firstName}
                onChange={handleChange}
              />
              <Input
                label="Last Name"
                name="lastName"
                value={workerData.lastName}
                onChange={handleChange}
              />
              <Input
                label="Age"
                type="number"
                name="age"
                value={workerData.age}
                onChange={handleChange}
              />
              <Input
                label="Address"
                name="address"
                value={workerData.address}
                onChange={handleChange}
              />
              <Input
                label="Gender"
                name="gender"
                value={workerData.gender}
                onChange={handleChange}
              />
              <Input
                label="Birthdate"
                type="date"
                name="birthdate"
                value={workerData.birthdate}
                onChange={handleChange}
              />
              <Input
                label="Place Assigned"
                name="placeAssigned"
                value={workerData.placeAssigned}
                onChange={handleChange}
              />
              <Input
                label="Username"
                name="username"
                value={workerData.username}
                onChange={handleChange}
                disabled // remove disabled if you want username to be editable
              />
              <Input
                type="file"
                label="ID Picture"
                name="idPic"
                onChange={handleFileChange}
              />
              <Input
                type="file"
                label="Profile Picture"
                name="profilePic"
                onChange={handleFileChange}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={handleUpdate}>
                Update
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default UpdateWorker;
