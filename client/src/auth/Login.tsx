import React from 'react'
import { Button, Image, Input, Link, Checkbox, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";

interface LoginProps {
  setRole: (role: "admin" | "worker") => void;
}

const Login: React.FC<LoginProps> = ({ setRole }) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [fullName, setFullName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [placeAssign, setPlaceAssign] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [loginIssue, setLoginIssue] = React.useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!acceptedTerms) return;

    try {
      const response = await fetch('https://health-center-repo-production.up.railway.app/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log("API Response:", data); // Log the full response for debugging

      if (response.ok) {
        // Save user details in session storage
        sessionStorage.setItem("id", data.id);
        sessionStorage.setItem("worker_id", data.worker_id); // Make sure to store worker_id
        sessionStorage.setItem("userRole", data.role);
        sessionStorage.setItem("firstName", data.first_name);
        sessionStorage.setItem("lastName", data.last_name);
        sessionStorage.setItem("profilePic", data.profile_pic);
        console.log("User details saved in sessionStorage:", data);

        // Set role state directly using setRole function passed from PrivateRoutes
        setRole(data.role);

        // Navigate based on the role
        navigate('/'); // Navigate to the appropriate dashboard
      } else {
        setErrorMessage(data.message); // Set the error message to display
      }
    } catch (error) {
      console.error("Login failed:", error);
      setErrorMessage("An error occurred during login.");
    }
  };

  const handleHelpRequest = () => {
    setIsModalOpen(true);
  };

  const handleSubmitHelpRequest = async () => {
    try {
      const response = await fetch('https://health-center-repo-production.up.railway.app/help-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          address,
          placeAssign,
          phoneNumber,
          loginIssue,
        }),
      });

      if (response.ok) {
        console.log("Help request submitted successfully");
        setIsModalOpen(false);
      } else {
        console.error("Failed to submit help request");
      }
    } catch (error) {
      console.error("Error submitting help request:", error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row flex-wrap h-screen">
      {/* Left Side: Login Form */}
      <div className="flex flex-col justify-top items-center w-full md:w-1/2 p-6">
        <div className="w-full md:w-[70%] flex flex-col justify-between h-full p-6 pb-0">
          <h1 className="mb-14 md:mb-2 text-2xl font-semibold">Get Started Now</h1>
          <div>
            <Input
              label="Enter Username"
              size="lg"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <div className="flex justify-between items-center mb-4 mt-2">
              <label className="text-sm font-medium">Password</label>
              <Link color="primary" onClick={handleHelpRequest} className="text-sm">
                Can't login?
              </Link>
            </div>
            <Input
              label="Enter Password"
              size="lg"
              className="mb-4"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {errorMessage && (
              <div className="text-red-600 text-sm mb-4">{errorMessage}</div>
            )}

            <div className="flex items-start space-x-2 mb-6">
              <Checkbox
                aria-label="Accept terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              <p className="text-xs text-gray-600 py-4">
                By signing in, you agree to our{" "}
                <Link color="primary" href="/terms" className="text-xs">Terms of Service</Link>{" "} and{" "}
                <Link className="text-xs" color="primary" href="/privacy">Privacy Policy</Link>.
              </p>
            </div>

            <Button
              className="w-full"
              color="primary"
              disabled={!acceptedTerms}
              size="lg"
              onClick={handleLogin}
            >
              Sign In
            </Button>
          </div>
          <p className="w-full text-center mt-8 md:mt-0">
            © 2024 Active, All Rights Reserved
          </p>
        </div>
      </div>

      {/* Right Side: Logo/Image */}
      <div className="hidden md:flex w-full md:w-1/2 p-4 md:p-8">
        <div className="bg-sky-600 flex flex-col w-full justify-top gap-8 md:gap-12 pt-12 md:pt-24 items-center rounded-[26px] p-8 md:pl-28">
          <div className="text-2xl md:text-3xl text-white font-medium w-full text-center md:text-left">
            <p>Effortless Workforce Management for Your Health Center</p>
            <p className="w-full text-md md:text-lg text-white mt-4">
              Enter your credentials to access your account
            </p>
          </div>

          <div className="shadow-md relative">
            <Image
              src="/dashboard.png" // Ensure the path is correct
              alt="Logo"
              className="object-fill"
            />
          </div>
        </div>
      </div>

      {/* Help Request Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
        <ModalContent>
          <ModalHeader>Request Help from Admin</ModalHeader>
          <ModalBody>
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
            <Input
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your address"
            />
            <Input
              label="Place Assigned"
              value={placeAssign}
              onChange={(e) => setPlaceAssign(e.target.value)}
              placeholder="Enter your place of assignment"
            />
            <Input
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
            />
            <Input
              label="Why can't you login?"
              value={loginIssue}
              onChange={(e) => setLoginIssue(e.target.value)}
              placeholder="Describe your issue"
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSubmitHelpRequest}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Login;
