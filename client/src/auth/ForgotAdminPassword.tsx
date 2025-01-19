// src/auth/ForgotAdminPassword.tsx

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input, Button, Card, CardBody } from "@nextui-org/react";
import axios from "axios";

const ForgotAdminPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState<string>("");
  const [newUsername, setNewUsername] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tokenParam = query.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setErrorMessage("Invalid or missing token.");
    }
  }, [location.search]);

  const handleSubmit = async () => {
    if (!newUsername || !newPassword) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    try {
      const response = await axios.post("https://health-center-repo-production.up.railway.app/reset-admin-password", {
        token,
        newUsername,
        newPassword,
      });

      if (response.status === 200) {
        setSuccessMessage("Password has been reset successfully.");
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setErrorMessage("Failed to reset password.");
      }
    } catch (error: any) {
      console.error("Error resetting password:", error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("An error occurred while resetting the password.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardBody>
          <h2 className="text-xl font-semibold mb-4">Reset Admin Password</h2>
          {errorMessage && (
            <div className="text-red-600 text-sm mb-4">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="text-green-600 text-sm mb-4">{successMessage}</div>
          )}
          <form className="flex flex-col gap-4">
            <Input
              label="Enter New Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter new username"
              required
            />
            <Input
              label="Enter New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
            <Button color="primary" onClick={handleSubmit}>
              Reset Password
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default ForgotAdminPassword;
