// src/components/modals/forms/pregnant/ViewPregnantCategoryTable.tsx

import React, { useEffect, useState } from "react";
import {
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { IoSearch } from "react-icons/io5";
import axios from "axios";
import { PrenatalForm } from "../../components/modals/forms/pregnant";
 // Adjust the import path if necessary

const ViewPregnantCategoryTable = () => {
  // Define internal types
  type ClientType = {
    id: number;
    worker_id: string;
    fname: string;
    category_name: string;
    address: string;
    phone_no: string;
    phil_id: string;
    date_registered: string; // ISO date string
  };

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [nextVisitDate, setNextVisitDate] = useState<string>("");
  const [isSettingNextVisit, setIsSettingNextVisit] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [existingDataModal, setExistingDataModal] = useState<boolean>(false);
  const [selectExistingDataModal, setSelectExistingDataModal] = useState<boolean>(false);
  const [clients, setClients] = useState<ClientType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientType | null>(null);
  const [existingDataOptions, setExistingDataOptions] = useState<any[]>([]);
  const [selectedData, setSelectedData] = useState<any>(null);

  const workerId = sessionStorage.getItem("id"); // Get workerId from session storage

  // Fetch pregnant client data and the next prenatal visit date
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(
          `health-center-repo-production.up.railway.app/pregnant/clients?worker_id=${workerId}&category_name=${encodeURIComponent(
            "Pregnant"
          )}`
        );
        setClients(response.data);
      } catch (error: any) {
        console.error("Error fetching clients:", error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchNextPrenatalVisitDate = async () => {
      try {
        const response = await axios.get("health-center-repo-production.up.railway.app/pregnant/get-next-visit-date");
        if (response.status === 200 && response.data.nextPrenatalVisitDate) {
          setNextVisitDate(response.data.nextPrenatalVisitDate);
        }
      } catch (error: any) {
        console.error("Error fetching next prenatal visit date:", error);
      }
    };

    fetchClients();
    fetchNextPrenatalVisitDate();
  }, [workerId]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleAddForm = async (client: ClientType) => {
    setSelectedClient(client);
    setSelectedData(null); // Reset selectedData when adding a new form
    try {
      const response = await axios.get(`health-center-repo-production.up.railway.app/pregnant-form/${client.id}`);
      if (response.status === 200) {
        const data = response.data;
        if (data && data.length > 0) {
          setExistingDataOptions(data);
          setExistingDataModal(true);
        } else {
          setIsOpen(true);
        }
      } else {
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Error checking existing data:", error);
      setIsOpen(true); // Proceed to open the form even if there's an error
    }
  };

  const handleCreateNew = () => {
    setExistingDataModal(false);
    setIsOpen(true);
  };

  const handleProceedToExisting = () => {
    setExistingDataModal(false);
    setSelectExistingDataModal(true);
  };

  const handleSelectExistingData = (data: any) => {
    setSelectedData(data);
    setSelectExistingDataModal(false);
    setIsOpen(true);
  };

  const handleSetNextPrenatalVisit = async () => {
    if (!nextVisitDate) {
      alert("Please select a date.");
      return;
    }

    setIsSettingNextVisit(true);

    try {
      const response = await axios.post("health-center-repo-production.up.railway.app/pregnant/check-missed-visits", {
        nextPrenatalVisitDate: nextVisitDate,
      });
      alert(response.data.message || "Next prenatal visit date set successfully.");
    } catch (error: any) {
      console.error("Error setting next prenatal visit date:", error);
      alert(
        `Error setting next prenatal visit date: ${
          error.response?.data?.error || error.message
        }`
      );
    } finally {
      setIsSettingNextVisit(false);
    }
  };

  const filteredClients = clients.filter((client) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      client.fname.toLowerCase().includes(searchLower) ||
      client.address.toLowerCase().includes(searchLower) ||
      client.phone_no.toLowerCase().includes(searchLower) ||
      (client.phil_id && client.phil_id.toLowerCase().includes(searchLower))
    );
  });

  if (loading) return <p>Loading clients...</p>;
  if (error) return <p>Error loading clients: {error}</p>;

  return (
    <div className="w-full p-2">
      <div className="flex flex-col md:flex-row items-center justify-between w-full mb-7 space-y-4 md:space-y-0">
        <h1 className="text-xl md:text-3xl font-bold pl-3">Pregnant Client List</h1>
        <div className="flex items-center gap-4">
          <Input
            size="lg"
            label="Search"
            startContent={<IoSearch />}
            placeholder="Type to search..."
            className="w-[350px]"
            value={searchQuery}
            onChange={handleSearch}
          />
          <Input
            size="lg"
            label="Set Next Prenatal Visit"
            type="date"
            placeholder="Select date"
            className="w-[250px]"
            value={nextVisitDate}
            onChange={(e) => setNextVisitDate(e.target.value)}
          />
          <Button
            onClick={handleSetNextPrenatalVisit}
            color="primary"
            disabled={!nextVisitDate || isSettingNextVisit}
          >
            {isSettingNextVisit ? "Setting..." : "Set Visit Date"}
          </Button>
        </div>
      </div>

      <Table isStriped aria-label="Pregnant client data table">
        <TableHeader>
          <TableColumn className="text-lg text-black py-4 pl-4">#</TableColumn>
          <TableColumn className="text-lg text-black py-4 pl-4">Name</TableColumn>
          <TableColumn className="text-lg text-black py-4 pl-4">Address</TableColumn>
          <TableColumn className="text-lg text-black py-4 pl-4">Phone</TableColumn>
          <TableColumn className="text-lg text-black py-4 pl-4">PhilHealth ID</TableColumn>
          <TableColumn className="text-lg text-black py-4 pl-4">Date Registered</TableColumn>
          <TableColumn className="text-lg text-black py-4 pl-4">Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {filteredClients.map((client, index) => (
            <TableRow key={client.id}>
              <TableCell className="text-base text-black font-bold py-4 pl-4">
                {index + 1}.
              </TableCell>
              <TableCell className="text-base text-black py-4 pl-4">{client.fname}</TableCell>
              <TableCell className="text-base text-black py-4 pl-4">{client.address}</TableCell>
              <TableCell className="text-base text-black py-4 pl-4">{client.phone_no}</TableCell>
              <TableCell className="text-base text-black py-4 pl-4">
                {client.phil_id || "N/A"}
              </TableCell>
              <TableCell className="text-base text-black py-4 pl-4">
                {new Date(client.date_registered).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-base text-black py-4 pl-4 flex items-center gap-5">
                <Button
                  onClick={() => handleAddForm(client)}
                  color="success"
                  size="sm"
                  className="text-white"
                >
                  Add Form
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Existing Data Modal */}
      <Modal isOpen={existingDataModal} onClose={() => setExistingDataModal(false)}>
        <ModalContent
          style={{
            maxWidth: "500px",
            width: "100%",
          }}
        >
          <ModalHeader>
            <div style={{ fontSize: "18px" }}>This client already has data in the system</div>
          </ModalHeader>
          <ModalBody>
            <div>Would you like to create a new record or proceed to existing data?</div>
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleCreateNew} color="primary">
              Create New
            </Button>
            <Button onClick={handleProceedToExisting} color="secondary">
              Proceed to Existing Data
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Select Existing Data Modal */}
      <Modal
        isOpen={selectExistingDataModal}
        onClose={() => setSelectExistingDataModal(false)}
      >
        <ModalContent
          style={{
            maxWidth: "500px",
            width: "100%",
          }}
        >
          <ModalHeader>
            <div style={{ fontSize: "18px" }}>Select Existing Data</div>
          </ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 gap-4">
              {existingDataOptions.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleSelectExistingData(option)}
                  color="secondary"
                  className="w-full"
                >
                  Data Entry #{index + 1}
                </Button>
              ))}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Form Modal */}
      {isOpen && (
        <PrenatalForm
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          data={selectedClient}
          selectedData={selectedData}
        />
      )}
    </div>
  );
};

export default ViewPregnantCategoryTable;
