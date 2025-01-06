import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Select,
  SelectItem
} from "@nextui-org/react";
import axios from 'axios';
import Swal from 'sweetalert2';
import { categories } from "../../../constants"; // Adjust this path as necessary

type Worker = {
  id: number;
  first_name: string;
  last_name: string;
};

const AdminOnlineForm: React.FC = () => {
  const [category, setCategory] = useState('');
  const [fname, setFname] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [philId, setPhilId] = useState('');
  const [gender, setGender] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
  const [isLoadingWorkers, setIsLoadingWorkers] = useState<boolean>(false);

  useEffect(() => {
    const fetchActiveWorkers = async () => {
      setIsLoadingWorkers(true);
      try {
        const response = await axios.get('http://localhost:8081/get-active-workers');
        if (response.status === 200) {
          setWorkers(response.data.workers);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to fetch active workers.',
          });
        }
      } catch (error) {
        console.error('Error fetching workers:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error occurred while fetching active workers.',
        });
      } finally {
        setIsLoadingWorkers(false);
      }
    };

    fetchActiveWorkers();
  }, []);

  const handleAddClient = async () => {
    if (!category || !fname || !address || !gender || !birthdate || selectedWorkerId === null) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill out all required fields (Category, Full Name, Address, Gender, Birthdate, and Select Worker).',
      });
      return;
    }

    try {
      const response = await axios.post('http://localhost:8081/online-add-client', {
        category_name: category,
        fname,
        address,
        phone_no: phoneNo,
        phil_id: philId,
        gender,
        worker_id: selectedWorkerId, 
        birthdate
      });

      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Client added successfully.',
        });
        // Reset the form
        setCategory('');
        setFname('');
        setAddress('');
        setPhoneNo('');
        setPhilId('');
        setGender('');
        setBirthdate('');
        setSelectedWorkerId(null);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to add client.',
        });
      }
    } catch (error: any) {
      if (error.response) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response.data.error || 'An error occurred while adding the client.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Network error or server is unreachable.',
        });
      }
      console.error('Error adding client:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Online Form</h1>
        <div className="flex flex-col gap-4">
          <Select
            label="Select Category"
            placeholder="Choose a category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </Select>

          <Select
            label="Select Worker"
            placeholder={isLoadingWorkers ? "Loading workers..." : "Choose a worker"}
            value={selectedWorkerId !== null ? selectedWorkerId.toString() : ''}
            onChange={(e) => setSelectedWorkerId(Number(e.target.value))}
            disabled={isLoadingWorkers}
          >
            {workers.map((worker) => (
              <SelectItem key={worker.id} value={worker.id.toString()}>
                {`${worker.first_name} ${worker.last_name}`}
              </SelectItem>
            ))}
          </Select>

          <Select
            label="Select Gender"
            placeholder="Choose gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <SelectItem key="male" value="Male">Male</SelectItem>
            <SelectItem key="female" value="Female">Female</SelectItem>
          </Select>

          <Input
            type="text"
            label="Full Name"
            placeholder="Enter full name"
            value={fname}
            onChange={(e) => setFname(e.target.value)}
            required
          />

          <Input
            type="text"
            label="Address"
            placeholder="Enter address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <Input
            type="text"
            label="Phone No. (optional)"
            placeholder="Enter phone number"
            value={phoneNo}
            onChange={(e) => setPhoneNo(e.target.value)}
          />

          <Input
            type="text"
            label="Philhealth ID (optional)"
            placeholder="Enter Philhealth ID"
            value={philId}
            onChange={(e) => setPhilId(e.target.value)}
          />

          <Input
            type="date"
            label="Birthdate"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            required
          />

          <Button color="primary" onPress={handleAddClient}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminOnlineForm;
