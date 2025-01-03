import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // For SweetAlert2

type PropsType = {
  isOpen: boolean;
  onClose: () => void;
  data: {
    id: number;
    firstName: string;
    lastName: string;
    age: number;
    address: string;
    gender: string;      // Changed to "gender"
    birthdate: string;
    placeAssigned: string;
    idPic: string;
    profilePic: string;
    username: string;    // Ensure we have "username"
  };
  onUpdate: () => void; // Refresh list after update
};

const UpdateWorker = ({ isOpen, onClose, data, onUpdate }: PropsType) => {
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
    const formData = new FormData();

    // Append string data
    formData.append("firstName", workerData.firstName);
    formData.append("lastName", workerData.lastName);
    formData.append("age", workerData.age);
    formData.append("address", workerData.address);
    formData.append("gender", workerData.gender);
    formData.append("birthdate", workerData.birthdate);
    formData.append("placeAssigned", workerData.placeAssigned);
    // If your backend updates the username in the same route, append it:
    // formData.append("username", workerData.username);

    // Append files if updated
    if (idPic) formData.append("id_pic", idPic);
    if (profilePic) formData.append("profile_pic", profilePic);

    try {
      const response = await axios.put(
        `http://localhost:8081/update-worker/${data.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        // Show success alert
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Worker updated successfully!",
        });
        onUpdate();
        onClose();
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: "Failed to update worker!",
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
              {/* If you want to allow editing the username here, remove 'disabled' */}
              <Input
                label="Username"
                name="username"
                value={workerData.username}
                onChange={handleChange}
                disabled 
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
