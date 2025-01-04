// View0to11MonthsOLdTable.tsx

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
import { Zeroto11Form } from "../../components/modals/forms/0-11Months";

const View0to11MonthsOLdTable = () => {
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
        const response = await fetch(
          `https://https://health-center-repo-production.up.railway.app/0-11monthsold/clients?worker_id=${workerId}&category_name=${encodeURIComponent(
            "0-11 Months Old Infants"
          )}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch clients: ${response.statusText}`);
        }
        const data: ClientType[] = await response.json();
        setClients(data);
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
      const response = await fetch(`https://https://health-center-repo-production.up.railway.app/0-11monthsold-form/${client.id}`);
      if (response.ok) {
        const data = await response.json();
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
          0-11 Months old infants - Immunization Services
        </h1>
        <Input
          size="lg"
          label="Search"
          startContent={<IoSearch />}
          placeholder="Type to search..."
          className="w-[350px]"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <Table isStriped aria-label="0-11 Months Old Infants client data table">
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
            maxWidth: '500px',
            width: '100%',
          }}
        >
          <ModalHeader>
            <div style={{ fontSize: '18px' }}>This client already has data in the system</div>
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
      <Modal isOpen={selectExistingDataModal} onClose={() => setSelectExistingDataModal(false)}>
        <ModalContent
          style={{
            maxWidth: '500px',
            width: '100%',
          }}
        >
          <ModalHeader>
            <div style={{ fontSize: '18px' }}>Select Existing Data</div>
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
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalContent
          style={{
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ModalHeader>
            <div style={{ fontSize: '18px' }}>
              {selectedData ? 'Edit Existing Data' : 'Add New Data'}
            </div>
          </ModalHeader>
          <ModalBody
            style={{
              overflowY: 'auto',
              flexGrow: 1,
              padding: '1rem',
            }}
          >
            <Zeroto11Form data={selectedClient} selectedData={selectedData} />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default View0to11MonthsOLdTable;
