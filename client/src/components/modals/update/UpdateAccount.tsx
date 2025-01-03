import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";

type PropsType = {
  isOpen: boolean;
  onClose: () => void;
  data: { id: number; username: string } | null;
  onUpdate: () => void;
};

const UpdateAccount: React.FC<PropsType> = ({ isOpen, onClose, data, onUpdate }) => {
  const [accountData, setAccountData] = useState({
    username: "",
    password: "",
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (data) {
      setAccountData({
        username: data.username || "",
        password: "",
      });
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountData((prev) => ({ ...prev, [name]: value }));
  };

  const openAdminModal = () => {
    if (!accountData.username || !accountData.password) {
      setError("Username and password are required.");
      return;
    }
    setError("");
    setIsAdminModalOpen(true);
  };

  const validateAdmin = async (adminPassword: string): Promise<boolean> => {
    try {
      const sessionRole = sessionStorage.getItem("userRole");
      console.log("Session Role:", sessionRole);

      const response = await axios.post("health-center-repo-production.up.railway.app/validate-admin", {
        adminPassword,
        sessionRole,
      });

      console.log("Validation Response:", response.data);

      return response.status === 200 && response.data.isValid;
    } catch (error: any) {
      console.error("Admin validation failed:", error.response?.data || error.message);
      return false;
    }
  };

  const updateUser = async (userId: number, username: string, password: string) => {
    try {
      console.log("Updating user with ID:", userId);
      console.log("Username:", username);
      console.log("Password:", password);

      const response = await axios.put(`health-center-repo-production.up.railway.app/update-user/${userId}`, {
        username,
        password,
      });

      if (response.status === 200) {
        alert("User updated successfully.");
      }
    } catch (error: any) {
      console.error("Failed to update user:", error.response?.data || error.message);
      throw new Error("Failed to update user.");
    }
  };

  const handleAdminSubmit = async () => {
    try {
      const isValidAdmin = await validateAdmin(adminPassword);
      if (!isValidAdmin) {
        setError("Invalid admin password.");
        return;
      }

      await updateUser(data?.id || 0, accountData.username, accountData.password);
      onUpdate();
      onClose();
      setIsAdminModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      {/* First Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader>Update Account</ModalHeader>
          <ModalBody>
            <Input
              label="Username"
              name="username"
              value={accountData.username}
              onChange={handleChange}
              placeholder="Enter new username"
            />
            <Input
              type="password"
              label="New Password"
              name="password"
              value={accountData.password}
              onChange={handleChange}
              placeholder="Enter new password"
            />
            {error && <p className="text-red-500">{error}</p>}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Close
            </Button>
            <Button color="primary" onPress={openAdminModal}>
              Next
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Admin Modal */}
      <Modal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} size="sm">
        <ModalContent>
          <ModalHeader>Admin Authorization</ModalHeader>
          <ModalBody>
            <Input
              type="password"
              label="Admin Password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter admin password"
            />
            {error && <p className="text-red-500">{error}</p>}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => setIsAdminModalOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleAdminSubmit}>
              Confirm Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateAccount;
