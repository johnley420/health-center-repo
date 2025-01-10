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
import axios from 'axios';  // Import AxiosError
import Swal from 'sweetalert2';  // Import SweetAlert2
import { categories } from "../../../constants";

type propsType = {
  isOpen: boolean;
  onClose: () => void;
};

const AddClient: React.FC<propsType> = ({ isOpen, onClose }) => {
  const workerId = sessionStorage.getItem("id");

  const [category, setCategory] = useState('');
  const [fname, setFname] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [philId, setPhilId] = useState('');
  const [gender, setGender] = useState('');
  const [birthdate, setBirthdate] = useState('');

  const [isDuplicate, setIsDuplicate] = useState(false);
  const [duplicateError, setDuplicateError] = useState('');

  // Function to check for duplicates
  const checkDuplicate = async () => {
    if (!fname || !philId) {
      setIsDuplicate(false);
      setDuplicateError('');
      return;
    }

    try {
      const response = await axios.post('https://health-center-repo-production.up.railway.app/check-duplicate', {
        fname,
        phil_id: philId
      });

      if (response.data.exists) {
        setIsDuplicate(true);
        setDuplicateError('A client with the same name and PhilHealth ID already exists.');
      } else {
        setIsDuplicate(false);
        setDuplicateError('');
      }
    } catch (error: unknown) {  // Handle the duplicate check error
      console.error('Error checking duplicate:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to check for duplicate clients.',
      });
    }
  };

  const handleAddClient = async () => {
    if (isDuplicate) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Client',
        text: duplicateError,
      });
      return;
    }

    if (!category || !fname || !address || !workerId || !gender || !birthdate) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill out the required fields',
      });
      return;
    }

    try {
      const response = await axios.post('https://health-center-repo-production.up.railway.app/add-client', {
        category_name: category,
        fname,
        address,
        phone_no: phoneNo,
        phil_id: philId,
        gender,
        worker_id: workerId,
        birthdate
      });

      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Client added successfully',
        });
        onClose(); // Close the modal after successful submission
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to add client',
        });
      }
    } catch (error: unknown) {  // Explicitly type error as unknown
      console.error('Error adding client:', error);

      if (axios.isAxiosError(error)) {
        // Access Axios-specific properties safely
        if (error.response && error.response.data && error.response.data.error) {
          const errorMessage = error.response.data.error;

          // Handle duplicate error specifically
          if (errorMessage.includes("already exists")) {
            Swal.fire({
              icon: 'error',
              title: 'Duplicate Client',
              text: errorMessage,
            });
            return;
          }

          // Handle other specific errors if needed
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage,
          });
        } else {
          // If there's no response or error message from server
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An unexpected error occurred while adding the client',
          });
        }
      } else {
        // Handle non-Axios errors
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An unexpected error occurred while adding the client',
        });
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="3xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Add Client
            </ModalHeader>
            <ModalBody className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <Select
                  label="Select Category"
                  className="max-w-xs"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="col-span-1">
                <Select
                  label="Select Gender"
                  className="max-w-xs"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <SelectItem key="male" value="Male">Male</SelectItem>
                  <SelectItem key="female" value="Female">Female</SelectItem>
                  <SelectItem key="other" value="Other">Other</SelectItem> 
                </Select>
              </div>

              <Input
                type="text"
                label={<span className="capitalize">Full Name</span>}
                value={fname}
                onChange={(e) => setFname(e.target.value)}
                required
              />

              <Input
                type="text"
                label={<span className="capitalize">Address</span>}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />

              <Input
                type="text"
                label={<span className="capitalize">Phone No.</span>}
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
              />

              <Input
                type="text"
                label={<span className="capitalize">PhilHealth ID (optional)</span>}
                value={philId}
                onChange={(e) => setPhilId(e.target.value)}
                onBlur={checkDuplicate} // Trigger duplicate check on blur
              />
              {isDuplicate && (
                <p className="text-red-500 text-sm col-span-2">{duplicateError}</p>
              )}

              <Input
                type="date"
                label={<span className="capitalize">Birthdate</span>}
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                required
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={handleAddClient}>
                Add
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddClient;
