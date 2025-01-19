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
    first_name: string;
    middle_name: string;
    last_name: string;
    age: number;
    address: string;
    gender: string;
    birthdate: string;
    place_assign: string;
    id_pic: string;
    profile_pic: string;
    username: string;
  };
  onUpdate: () => void;
};

const UpdateWorker: React.FC<PropsType> = ({ isOpen, onClose, data, onUpdate }) => {
  const [workerData, setWorkerData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    age: "",
    address: "",
    gender: "",
    birthdate: "",
    place_assign: "",
    username: "",
  });

  const [id_pic, setIdPic] = useState<File | null>(null);
  const [profile_pic, setProfilePic] = useState<File | null>(null);

  // Initialize worker data when modal opens
  useEffect(() => {
    if (data) {
      setWorkerData({
        first_name: data.first_name || "",
        middle_name: data.middle_name || "",
        last_name: data.last_name || "",
        age: data.age?.toString() || "",
        address: data.address || "",
        gender: data.gender || "",
        birthdate: data.birthdate || "",
        place_assign: data.place_assign || "",
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
      if (name === "id_pic") setIdPic(files[0]);
      if (name === "profile_pic") setProfilePic(files[0]);
    }
  };

  // Handle update submission
  const handleUpdate = async () => {
    try {
      const formData = new FormData();

      // Append text fields
      formData.append("first_name", workerData.first_name);
      formData.append("middle_name", workerData.middle_name);
      formData.append("last_name", workerData.last_name);
      formData.append("age", workerData.age);
      formData.append("address", workerData.address);
      formData.append("gender", workerData.gender);
      formData.append("birthdate", workerData.birthdate);
      formData.append("place_assign", workerData.place_assign);
      formData.append("username", workerData.username);

      // Append files if new ones selected
      if (id_pic) formData.append("id_pic", id_pic);
      if (profile_pic) formData.append("profile_pic", profile_pic);

      // Send PUT request
      const response = await axios.put(
        `https://health-center-repo-production.up.railway.app/update-worker/${data.id}`,
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
                name="first_name" // snake_case
                value={workerData.first_name}
                onChange={handleChange}
                required
              />
              <Input
                label="Middle Name" // New Middle Name Input
                name="middle_name" // snake_case
                value={workerData.middle_name}
                onChange={handleChange}
                required
              />
              <Input
                label="Last Name"
                name="last_name" // snake_case
                value={workerData.last_name}
                onChange={handleChange}
                required
              />
              <Input
                label="Age"
                type="number"
                name="age"
                value={workerData.age}
                onChange={handleChange}
                required
              />
              <Input
                label="Address"
                name="address"
                value={workerData.address}
                onChange={handleChange}
                required
              />
              <Input
                label="Gender"
                name="gender"
                value={workerData.gender}
                onChange={handleChange}
                required
              />
              <Input
                label="Birthdate"
                type="date"
                name="birthdate"
                value={workerData.birthdate}
                onChange={handleChange}
                required
              />
              <Input
                label="Place Assigned"
                name="place_assign" // snake_case
                value={workerData.place_assign}
                onChange={handleChange}
                required
              />
              <Input
                label="Username"
                name="username"
                value={workerData.username}
                onChange={handleChange}
                disabled // Remove disabled if you want username to be editable
                required
              />
              <Input
                type="file"
                label="ID Picture"
                name="id_pic" // snake_case
                onChange={handleFileChange}
              />
              <Input
                type="file"
                label="Profile Picture"
                name="profile_pic" // snake_case
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
