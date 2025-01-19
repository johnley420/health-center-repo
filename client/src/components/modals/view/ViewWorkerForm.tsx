import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@nextui-org/react";
import React, { useState } from "react";
import Swal from "sweetalert2"; // Import SweetAlert2

type PropsTypes = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void; // Notify parent on successful addition
};

const ViewWorkerForm = ({ isOpen, onClose, onAdd }: PropsTypes) => {
  const [birthDate, setBirthDate] = useState("");
  const [age, setAge] = useState<number | string>("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState(""); // New state for Middle Name
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [placeAssign, setPlaceAssign] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [idPic, setIdPic] = useState<File | null>(null);
  const [profilePic, setProfilePic] = useState<File | null>(null);

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setBirthDate(selectedDate);
    const calculatedAge = calculateAge(new Date(selectedDate));
    setAge(calculatedAge);
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    if (type === "id_pic") {
      setIdPic(e.target.files?.[0] || null);
    } else if (type === "profile_pic") {
      setProfilePic(e.target.files?.[0] || null);
    }
  };

  // Optional: Client-side duplicate check
  const checkDuplicate = async () => {
    try {
      const response = await fetch("https://health-center-repo-production.up.railway.app/check-duplicate-worker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ first_name: firstName, middle_name: middleName, last_name: lastName }),
      });

      const data = await response.json();
      return data.isDuplicate;
    } catch (error) {
      console.error("Error checking duplicate:", error);
      return false; // Assume no duplicate if an error occurs
    }
  };

  const handleSubmit = async () => {
    // Optional: Check for duplicate before submitting
    const isDuplicate = await checkDuplicate();
    if (isDuplicate) {
      Swal.fire({
        icon: "warning",
        title: "Duplicate Worker",
        text: "A worker with the same name already exists.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("first_name", firstName);
    formData.append("middle_name", middleName); // Add middle name
    formData.append("last_name", lastName);
    formData.append("birth_date", birthDate);
    formData.append("age", age.toString());
    formData.append("gender", gender);
    formData.append("address", address);
    formData.append("place_assign", placeAssign);
    formData.append("username", username);
    formData.append("password", password);
    if (idPic) formData.append("id_pic", idPic);
    if (profilePic) formData.append("profile_pic", profilePic);

    try {
      const response = await fetch("https://health-center-repo-production.up.railway.app/upload-worker", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        Swal.fire({
          icon: "error",
          title: "Failed to Add Worker",
          text: errorData.message || "An error occurred while adding the worker.",
        });
        return;
      }

      const result = await response.json();
      console.log("Server response:", result);
      Swal.fire({
        icon: "success",
        title: "Worker Added",
        text: "The worker has been added successfully!",
      });
      onAdd(); // Notify parent component to refresh data
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add worker. Please try again later.",
      });
    }

    onClose();
  };

  return (
    <Modal scrollBehavior="outside" size="5xl" isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Add Worker</ModalHeader>
            <ModalBody>
              <form className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="Enter first name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                
                {/* Middle Name Input */}
                <Input
                  label="Middle Name"
                  placeholder="Enter middle name"
                  required
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                />

                <Input
                  label="Last Name"
                  placeholder="Enter last name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                
                <Input
                  label="Birth Date"
                  type="date"
                  required
                  value={birthDate}
                  onChange={handleBirthDateChange}
                />
                
                <Input label="Age" type="number" value={age.toString()} readOnly required />
                
                <Select
                  label="Sex"
                  placeholder="Select a gender"
                  required
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <SelectItem key="Male" value="Male">
                    Male
                  </SelectItem>
                  <SelectItem key="Female" value="Female">
                    Female
                  </SelectItem>
                  <SelectItem key="Others" value="Others">
                    Others
                  </SelectItem>
                </Select>
                
                <Input
                  label="Address"
                  placeholder="Enter address"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                
                <Select
                  label="Place Assign"
                  placeholder="Select a place"
                  required
                  value={placeAssign}
                  onChange={(e) => setPlaceAssign(e.target.value)}
                >
                  <SelectItem key="purok1" value="purok1">
                    Purok 1
                  </SelectItem>
                  <SelectItem key="purok2a" value="purok2a">
                    Purok 2A
                  </SelectItem>
                  <SelectItem key="purok2b" value="purok2b">
                    Purok 2B
                  </SelectItem>
                  <SelectItem key="purok3a1" value="purok3a1">
                    Purok 3A-1
                  </SelectItem>
                  <SelectItem key="purok3a2" value="purok3a2">
                    Purok 3A-2
                  </SelectItem>
                  <SelectItem key="purok3b" value="purok3b">
                    Purok 3B
                  </SelectItem>
                  <SelectItem key="purok4a" value="purok4a">
                    Purok 4A
                  </SelectItem>
                  <SelectItem key="purok4b" value="purok4b">
                    Purok 4B
                  </SelectItem>
                  <SelectItem key="purok5" value="purok5">
                    Purok 5
                  </SelectItem>
                  <SelectItem key="purok6" value="purok6">
                    Purok 6
                  </SelectItem>
                </Select>
                
                <Input
                  label="Username"
                  placeholder="Enter username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                
                <Input
                  label="ID Picture"
                  type="file"
                  onChange={(e) => handleFileChange(e, "id_pic")}
                  required
                />
                
                <Input
                  label="Profile Picture"
                  type="file"
                  onChange={(e) => handleFileChange(e, "profile_pic")}
                  required
                />
              </form>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={handleSubmit}>
                Submit
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ViewWorkerForm;
