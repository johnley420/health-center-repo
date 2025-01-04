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
import axios from 'axios';  // Import axios for API calls
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

  const handleAddClient = async () => {
    if (!category || !fname || !address || !workerId || !gender || !birthdate) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill out the required fields',
      });
      return;
    }

    try {
      const response = await axios.post('https://https://health-center-repo-production.up.railway.app/add-client', {
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
    } catch (error) {
      console.error('Error adding client:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error occurred while adding client',
      });
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
                </Select>
              </div>

              <Input
                type="text"
                label={<span className="capitalize">First Name</span>}
                value={fname}
                onChange={(e) => setFname(e.target.value)}
              />

              <Input
                type="text"
                label={<span className="capitalize">Address</span>}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <Input
                type="text"
                label={<span className="capitalize">Phone No.</span>}
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
              />

              <Input
                type="text"
                label={<span className="capitalize">Philhealth ID (optional)</span>}
                value={philId}
                onChange={(e) => setPhilId(e.target.value)}
              />

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
