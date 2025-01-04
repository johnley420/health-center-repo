// src/components/modals/forms/0-9CHILDMONTH/View0to9ChildMonthOldTable.tsx

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
import { ZEROTO9CHILDMONTHFORM } from "../../components/modals/forms/0-59Children";
 // Updated import path

const View0to9ChildMonthOldTable = () => {
  // Define internal types
  type ClientType = {
    id: number;
    worker_id: string;
    fname: string; // Combined first, middle, last name
    category_name: string;
    address: string; // Full address
    phone_no: string;
    phil_id: string;
    // date_registered: string; // Removed
  };

  const [searchQuery, setSearchQuery] = useState<string>("");
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

  // Fetch clients data from the server
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(
          `https://https://health-center-repo-production.up.railway.app/0-59months-old/clients?worker_id=${workerId}&category_name=${encodeURIComponent(
            "0-59 Months Old Children"
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

    fetchClients();
  }, [workerId]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleAddForm = async (client: ClientType) => {
    setSelectedClient(client);
    setSelectedData(null); // Reset selectedData when adding a new form
    try {
      const response = await axios.get(`https://https://health-center-repo-production.up.railway.app/zero_to_ninechildmonths-form/${client.id}`);
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
      <div className="flex flex-col md:flex-row items-center justify-between w-full mb-7">
        <h1 className="text-xl md:text-3xl font-bold pl-3">
          0-59 Months Old Children - Nutrition Services
        </h1>
        <Input
          size="lg"
          label="Search"
          startContent={<IoSearch />}
          placeholder="Type to search..."
          className="w-[350px]"
          value={searchQuery} // Bind the input value to state
          onChange={handleSearch} // Update the search query on change
        />
      </div>

      <Table isStriped aria-label="0-59 Months Old Children - Nutrition Services data table">
        <TableHeader>
          <TableColumn className="text-lg text-black py-4 pl-4">#</TableColumn>
          <TableColumn className="text-lg text-black py-4 pl-4">Name</TableColumn>
          <TableColumn className="text-lg text-black py-4 pl-4">Address</TableColumn>
          <TableColumn className="text-lg text-black py-4 pl-4">Phone</TableColumn>
          <TableColumn className="text-lg text-black py-4 pl-4">PhilHealth ID</TableColumn>
          <TableColumn className="text-lg text-black py-4 pl-4">Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {filteredClients.map((client, index) => (
            <TableRow key={client.id}>
              <TableCell className="text-base text-black font-bold py-4 pl-4">
                {index + 1}.
              </TableCell>
              <TableCell className="text-base text-black py-4 pl-4">
                {client.fname}
              </TableCell>
              <TableCell className="text-base text-black py-4 pl-4">
                {client.address}
              </TableCell>
              <TableCell className="text-base text-black py-4 pl-4">
                {client.phone_no}
              </TableCell>
              <TableCell className="text-base text-black py-4 pl-4">
                {client.phil_id || "N/A"}
              </TableCell>
              <TableCell className="text-base text-black py-4 pl-4 flex items-center gap-5">
                <Button
                  onClick={() => handleAddForm(client)}
                  color="success" // Change color to success
                  size="sm"
                  className="text-white" // Set text color to white
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
            <div style={{ fontSize: "18px" }}>
              This client already has data in the system
            </div>
          </ModalHeader>
          <ModalBody>
            <div>
              Would you like to create a new record or proceed to existing data?
            </div>
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
            maxWidth: "800px",
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
        <ZEROTO9CHILDMONTHFORM
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          data={selectedClient}
          selectedData={selectedData}
        />
      )}
    </div>
  );
};

export default View0to9ChildMonthOldTable;
