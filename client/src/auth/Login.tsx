import React from "react";
import {
  Button,
  Image,
  Input,
  Link,
  Checkbox,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";

// ---- Icons (from NextUI docs) ----
export const EyeSlashFilledIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M21.2714 9.17834C20.9814 8.71834 20.6714 8.28834 20.3514 7.88834C19.9814 7.41834 19.2814 7.37834 18.8614 7.79834L15.8614 10.7983C16.0814 11.4583 16.1214 12.2183 15.9214 13.0083C15.5714 14.4183 14.4314 15.5583 13.0214 15.9083C12.2314 16.1083 11.4714 16.0683 10.8114 15.8483C10.8114 15.8483 9.38141 17.2783 8.35141 18.3083C7.85141 18.8083 8.01141 19.6883 8.68141 19.9483C9.75141 20.3583 10.8614 20.5683 12.0014 20.5683C13.7814 20.5683 15.5114 20.0483 17.0914 19.0783C18.7014 18.0783 20.1514 16.6083 21.3214 14.7383C22.2714 13.2283 22.2214 10.6883 21.2714 9.17834Z"
        fill="currentColor"
      />
      <path
        d="M14.0206 9.98062L9.98062 14.0206C9.47062 13.5006 9.14062 12.7806 9.14062 12.0006C9.14062 10.4306 10.4206 9.14062 12.0006 9.14062C12.7806 9.14062 13.5006 9.47062 14.0206 9.98062Z"
        fill="currentColor"
      />
      <path
        d="M18.25 5.74969L14.86 9.13969C14.13 8.39969 13.12 7.95969 12 7.95969C9.76 7.95969 7.96 9.76969 7.96 11.9997C7.96 13.1197 8.41 14.1297 9.14 14.8597L5.76 18.2497H5.75C4.64 17.3497 3.62 16.1997 2.75 14.8397C1.75 13.2697 1.75 10.7197 2.75 9.14969C3.91 7.32969 5.33 5.89969 6.91 4.91969C8.49 3.95969 10.22 3.42969 12 3.42969C14.23 3.42969 16.39 4.24969 18.25 5.74969Z"
        fill="currentColor"
      />
      <path
        d="M14.8581 11.9981C14.8581 13.5681 13.5781 14.8581 11.9981 14.8581C11.9381 14.8581 11.8881 14.8581 11.8281 14.8381L14.8381 11.8281C14.8581 11.8881 14.8581 11.9381 14.8581 11.9981Z"
        fill="currentColor"
      />
      <path
        d="M21.7689 2.22891C21.4689 1.92891 20.9789 1.92891 20.6789 2.22891L2.22891 20.6889C1.92891 20.9889 1.92891 21.4789 2.22891 21.7789C2.37891 21.9189 2.56891 21.9989 2.76891 21.9989C2.96891 21.9989 3.15891 21.9189 3.30891 21.7689L21.7689 3.30891C22.0789 3.00891 22.0789 2.52891 21.7689 2.22891Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const EyeFilledIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M21.25 9.14969C18.94 5.51969 15.56 3.42969 12 3.42969C10.22 3.42969 8.49 3.94969 6.91 4.91969C5.33 5.89969 3.91 7.32969 2.75 9.14969C1.75 10.7197 1.75 13.2697 2.75 14.8397C5.06 18.4797 8.44 20.5597 12 20.5597C13.78 20.5597 15.51 20.0397 17.09 19.0697C18.67 18.0897 20.09 16.6597 21.25 14.8397C22.25 13.2797 22.25 10.7197 21.25 9.14969ZM12 16.0397C9.76 16.0397 7.96 14.2297 7.96 11.9997C7.96 9.76969 9.76 7.95969 12 7.95969C14.24 7.95969 16.04 9.76969 16.04 11.9997C16.04 14.2297 14.24 16.0397 12 16.0397Z"
        fill="currentColor"
      />
      <path
        d="M11.9984 9.14062C10.4284 9.14062 9.14844 10.4206 9.14844 12.0006C9.14844 13.5706 10.4284 14.8506 11.9984 14.8506C13.5684 14.8506 14.8584 13.5706 14.8584 12.0006C14.8584 10.4306 13.5684 9.14062 11.9984 9.14062Z"
        fill="currentColor"
      />
    </svg>
  );
};

// ---- Login component props ----
interface LoginProps {
  setRole: (role: "admin" | "worker") => void;
}

// ---- Main component ----
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
  const [isVisible, setIsVisible] = React.useState(false); // <-- for show/hide password
  const navigate = useNavigate();

  // Toggle the password visibility
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const handleLogin = async () => {
    if (!acceptedTerms) return;

    try {
      const response = await fetch(
        "http://localhost:8081/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();
      console.log("API Response:", data);

      if (response.ok) {
        // Save user details
        sessionStorage.setItem("id", data.id);
        sessionStorage.setItem("worker_id", data.worker_id);
        sessionStorage.setItem("userRole", data.role);
        sessionStorage.setItem("firstName", data.first_name);
        sessionStorage.setItem("lastName", data.last_name);
        sessionStorage.setItem("profilePic", data.profile_pic);

        // Set role and navigate
        setRole(data.role);
        navigate("/");
      } else {
        setErrorMessage(data.message);
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
      const response = await fetch(
        "http://localhost:8081/help-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName,
            address,
            placeAssign,
            phoneNumber,
            loginIssue,
          }),
        }
      );

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
                Can&apos;t login?
              </Link>
            </div>

            {/* Show/Hide Password Implementation */}
            <Input
              label="Enter Password"
              size="lg"
              className="mb-4"
              type={isVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              // Use `endContent` for NextUI v2
              endContent={
                <button
                  type="button"
                  onClick={toggleVisibility}
                  aria-label="toggle password visibility"
                  className="focus:outline-none"
                >
                  {isVisible ? (
                    <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
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
                <Link color="primary" href="/terms" className="text-xs">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link className="text-xs" color="primary" href="/privacy">
                  Privacy Policy
                </Link>
                .
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
