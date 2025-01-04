import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
} from "@nextui-org/react";
import { IoSearch } from "react-icons/io5";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { MdAccountCircle } from "react-icons/md"; 
import UpdateWorker from "../../components/modals/update/UpdateWorker";
import UpdateAccount from "../../components/modals/update/UpdateAccount";
import ViewWorkerForm from "../../components/modals/view/ViewWorkerForm";

interface Worker {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  birth_date: string;
  age: number;
  gender: string;
  address: string;
  place_assign: string;
  id_pic: string;
  profile_pic: string;
  date_of_reg: string;
  status: string;
}

const List: React.FC = () => {
  const [workersData, setWorkersData] = useState<Worker[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await axios.get("https://https://health-center-repo-production.up.railway.app/admin/workers");
        const activeWorkers = response.data.filter(
          (worker: Worker) => worker.status === "Active"
        );
        setWorkersData(activeWorkers);
        setFilteredWorkers(activeWorkers);
      } catch (error) {
        console.error("Error fetching worker data:", error);
      }
    };
    fetchWorkers();
  }, []);

  const handleSearch = () => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const filtered = workersData.filter(
      (worker) =>
        worker.first_name.toLowerCase().includes(lowercasedTerm) ||
        worker.last_name.toLowerCase().includes(lowercasedTerm) ||
        worker.address.toLowerCase().includes(lowercasedTerm)
    );
    setFilteredWorkers(filtered);
  };

  const handleEdit = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsEditOpen(true);
  };

  const handleDeactivate = async (workerId: number) => {
    const confirmDeactivate = window.confirm(
      "Do you want to deactivate this worker account?"
    );
    if (!confirmDeactivate) return;

    try {
      await axios.put(`https://https://health-center-repo-production.up.railway.app/admin/workers/${workerId}`, {
        status: "Inactive",
      });

      const updatedWorkers = workersData.filter(
        (worker) => worker.id !== workerId
      );
      setWorkersData(updatedWorkers);
      setFilteredWorkers(updatedWorkers);
      alert("Worker account deactivated successfully.");
    } catch (error) {
      console.error("Error deactivating worker:", error);
      alert("Failed to deactivate the worker account.");
    }
  };

  const handleOpenAccount = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsAccountOpen(true);
  };

  return (
    <div className="worker-list">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Worker List</h1>
        <div className="flex items-center gap-4">
          <Input
            size="lg"
            label="Search"
            startContent={<IoSearch onClick={handleSearch} className="cursor-pointer" />}
            placeholder="Type to search..."
            className="w-[350px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <Button color="primary" size="lg" onClick={() => setIsAddWorkerOpen(true)}>
            Add Worker
          </Button>
        </div>
      </div>

      <Table isStriped aria-label="Worker table">
        <TableHeader>
          <TableColumn>No</TableColumn>
          <TableColumn>Full Name</TableColumn>
          <TableColumn>Birthdate</TableColumn>
          <TableColumn>Age</TableColumn>
          <TableColumn>Gender</TableColumn>
          <TableColumn>Address</TableColumn>
          <TableColumn>Place Assign</TableColumn>
          <TableColumn>ID Pic</TableColumn>
          <TableColumn>Profile Pic</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {filteredWorkers.map((worker, index) => (
            <TableRow key={worker.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{`${worker.first_name} ${worker.last_name}`}</TableCell>
              <TableCell>{worker.birth_date}</TableCell>
              <TableCell>{worker.age}</TableCell>
              <TableCell>{worker.gender}</TableCell>
              <TableCell>{worker.address}</TableCell>
              <TableCell>{worker.place_assign}</TableCell>
              <TableCell>
                <img
                  src={`https://https://health-center-repo-production.up.railway.app/uploads/images/${worker.id_pic}`}
                  alt="ID"
                  className="w-16 h-16 object-cover"
                />
              </TableCell>
              <TableCell>
                <img
                  src={`https://https://health-center-repo-production.up.railway.app/uploads/images/${worker.profile_pic}`}
                  alt="Profile"
                  className="w-16 h-16 object-cover"
                />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <FiEdit2
                    onClick={() => handleEdit(worker)}
                    className="cursor-pointer text-blue-500"
                    style={{ fontSize: "1.5rem" }}
                  />
                  <FiTrash2
                    onClick={() => handleDeactivate(worker.id)}
                    className="cursor-pointer text-red-500"
                    style={{ fontSize: "1.5rem" }}
                  />
                  <MdAccountCircle
                    onClick={() => handleOpenAccount(worker)}
                    className="cursor-pointer text-green-500"
                    style={{ fontSize: "1.5rem" }}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ADD WORKER MODAL */}
      {isAddWorkerOpen && (
        <ViewWorkerForm
          isOpen={isAddWorkerOpen}
          onClose={() => setIsAddWorkerOpen(false)}
          onAdd={() => {
            setIsAddWorkerOpen(false);
            handleSearch(); 
          }}
        />
      )}

      {/* UPDATE WORKER MODAL */}
      {isEditOpen && selectedWorker && (
        <UpdateWorker
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          data={{
            id: selectedWorker.id,
            firstName: selectedWorker.first_name,
            lastName: selectedWorker.last_name,
            age: selectedWorker.age,
            address: selectedWorker.address,
            gender: selectedWorker.gender,    // Use "gender"
            birthdate: selectedWorker.birth_date,
            placeAssigned: selectedWorker.place_assign,
            idPic: selectedWorker.id_pic,
            profilePic: selectedWorker.profile_pic,
            username: selectedWorker.username, // Make sure username is included
          }}
          onUpdate={() => {
            setIsEditOpen(false);
            handleSearch(); 
          }}
        />
      )}

      {/* UPDATE ACCOUNT MODAL */}
      {isAccountOpen && selectedWorker && (
        <UpdateAccount
          isOpen={isAccountOpen}
          onClose={() => setIsAccountOpen(false)}
          data={{
            id: selectedWorker.id,
            username: selectedWorker.username,
          }}
          onUpdate={() => {
            setIsAccountOpen(false);
            handleSearch();
          }}
        />
      )}
    </div>
  );
};

export default List;
