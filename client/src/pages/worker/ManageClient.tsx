// ManageClient.tsx
import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react"; // Corrected imports
import { IoSearch } from "react-icons/io5";
import { LuPencil } from "react-icons/lu";
import { FaRegTrashCan } from "react-icons/fa6";
import { MdLocationPin } from "react-icons/md";
import AddClient from "../../components/modals/add/AddClient";
import { useNavigate } from "react-router-dom";
import ViewCLientInfo from "../../components/modals/view/ViewCLientInfo";
import UpdateClient from "../../components/modals/update/UpdateClient";
import { CategoryFilter, clientColumn } from "../../constants";
import axios from 'axios'; // Import axios for API calls
import Swal from 'sweetalert2'; // Import SweetAlert2

// Define ClientTypes
type ClientTypes = {
  id: number;
  fname: string;
  address: string;
  phone_no: string;
  phil_id?: string;
  date_registered: string;
  category_name: string;
  latitude: number;
  longitude: number;
  status: string;
};

const ManageClient = () => {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [isOpenAdd, setIsOpenAdd] = useState<boolean>(false);
  const [isOpenView, setIsOpenView] = useState<boolean>(false);
  const [isOpenUpdate, setIsOpenUpdate] = useState<boolean>(false);
  const [clientInfo, setClientInfo] = useState<ClientTypes | undefined>();
  const [clientData, setClientData] = useState<ClientTypes[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // New States for Pending Clients
  const [isOpenPending, setIsOpenPending] = useState<boolean>(false);
  const [pendingClients, setPendingClients] = useState<ClientTypes[]>([]);
  const [loadingPending, setLoadingPending] = useState<boolean>(false);
  const [errorPending, setErrorPending] = useState<string | null>(null);

  const workerId = sessionStorage.getItem("id");

  // Fetch active client data from server
  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8081/clients?workerId=${workerId}&status=active`);
      setClientData(response.data);
    } catch (error: any) {
      console.error("Error fetching clients:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending clients
  const fetchPendingClients = async () => {
    setLoadingPending(true);
    try {
      const response = await axios.get(`http://localhost:8081/pending-clients?workerId=${workerId}`);
      setPendingClients(response.data);
    } catch (error: any) {
      console.error("Error fetching pending clients:", error.message);
      setErrorPending(error.message);
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [workerId]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(event.target.value);
  };

  const handleDeleteClient = async (clientId: number) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;

    try {
      const response = await axios.put(`http://localhost:8081/clients/${clientId}/status`, {
        status: "Inactive",
      });

      if (response.status === 200) {
        setClientData((prevData) => prevData.filter((client) => client.id !== clientId));
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Client has been marked as inactive.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to mark client as inactive.',
        });
      }
    } catch (error: any) {
      console.error("Error updating client status:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to mark client as inactive.',
      });
    }
  };

  // Handle activation of a pending client
  const handleActivateClient = async (clientId: number) => {
    if (!window.confirm("Are you sure you want to activate this client?")) return;

    try {
      const response = await axios.put(`http://localhost:8081/clients/${clientId}/status`, {
        status: "Active",
      });

      if (response.status === 200) {
        setPendingClients((prevData) => prevData.filter((client) => client.id !== clientId));
        fetchClients(); // Optionally, refetch active clients
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Client has been activated.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to activate client.',
        });
      }
    } catch (error: any) {
      console.error("Error activating client:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to activate client.',
      });
    }
  };

  const filteredClients = clientData.filter((client: ClientTypes) => {
    const matchesSearch = client.fname.toLowerCase().includes(searchTerm);
    const matchesCategory = categoryFilter === "All" || client.category_name === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...CategoryFilter];

  const handleMapClick = (client: ClientTypes) => {
    navigate("/view-map", {
      state: { clientId: client.id, latitude: client.latitude, longitude: client.longitude },
    });
  };

  if (loading) return <p>Loading clients...</p>;
  if (error) return <p>Error loading clients: {error}</p>;

  return (
    <div className="w-full p-2">
      {/* Header with Add and Pending Clients Buttons */}
      <div className="flex flex-col md:flex-row gap-5 md:items-center md:justify-between w-full mb-7">
        <h1 className="text-3xl font-bold pl-3">Client List</h1>
        <div className="flex items-center justify-center gap-5 max-w-xl w-full">
          <Input
            size="md"
            label="Search"
            startContent={<IoSearch />}
            placeholder="Type to search..."
            value={searchTerm}
            onChange={handleSearchChange}
          />

          <select
            id="categoryFilter"
            value={categoryFilter}
            onChange={handleFilterChange}
            className="w-full sm:w-[200px] md:w-[250px] lg:w-[200px] h-[55px] px-4 py-2 bg-[#F4F4F5] border border-gray-300 rounded-md focus:outline-none text-[#92929A]"
          >
            {categories.map((category) => (
              <option key={category} value={category} className="py-2 text-gray-800">
                {category}
              </option>
            ))}
          </select>

          <Button color="primary" size="lg" onPress={() => setIsOpenAdd(true)}>
            Add
          </Button>

          {/* New Button: Pending Clients */}
          <Button
            color="secondary"
            size="lg"
            onPress={() => {
              setIsOpenPending(true);
              fetchPendingClients();
            }}
          >
            Pending
          </Button>
        </div>
      </div>

      {/* Active Clients Table */}
      <Table isStriped aria-label="Client data table">
        <TableHeader>
          {clientColumn.map((item, index) => (
            <TableColumn key={index} className="text-lg text-black py-4 pl-4">
              {item}
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {filteredClients.map((client: ClientTypes, index: number) => (
            <TableRow key={client.id}>
              <TableCell className="text-base text-black font-bold py-4 pl-4">{index + 1}.</TableCell>
              <TableCell className="text-base text-black py-4 pl-4">{client.fname}</TableCell>
              <TableCell className="text-base text-black py-4 pl-4">{client.address}</TableCell>
              <TableCell className="text-base text-black py-4 pl-4">{client.phone_no}</TableCell>
              <TableCell className="text-base text-black py-4 pl-4">{client.phil_id || "N/A"}</TableCell>
              <TableCell className="text-base text-black py-4 pl-4">
                {new Date(client.date_registered).toLocaleDateString("en-US")}
              </TableCell>
              <TableCell className="text-base text-black py-4 pl-4 flex items-center gap-5">
                <button onClick={() => handleMapClick(client)}>
                  <MdLocationPin size={24} className="text-yellow-500" />
                </button>
                <button
                  onClick={() => {
                    setClientInfo(client);
                    setIsOpenUpdate(true);
                  }}
                >
                  <LuPencil size={24} className="text-green-500" />
                </button>
                <button onClick={() => handleDeleteClient(client.id)}>
                  <FaRegTrashCan size={24} className="text-red-500" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Existing Modals */}
      {isOpenAdd && <AddClient isOpen={isOpenAdd} onClose={() => setIsOpenAdd(false)} />}
      {isOpenView && <ViewCLientInfo isOpen={isOpenView} onClose={() => setIsOpenView(false)} data={clientInfo} />}
      {isOpenUpdate && (
        <UpdateClient
          isOpen={isOpenUpdate}
          onClose={() => setIsOpenUpdate(false)}
          data={clientInfo}
          onUpdate={fetchClients}
        />
      )}

      {/* New Modal: Pending Clients */}
      <Modal
        closeButton
        aria-labelledby="modal-title"
        isOpen={isOpenPending} // Correct prop
        onOpenChange={(open) => setIsOpenPending(open)} // Correct event handler
        size="full"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {/* Replaced Text with a styled div */}
                <div id="modal-title" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  Pending Clients
                </div>
              </ModalHeader>
              <ModalBody>
                {loadingPending ? (
                  <p>Loading pending clients...</p>
                ) : errorPending ? (
                  <p>Error loading pending clients: {errorPending}</p>
                ) : pendingClients.length === 0 ? (
                  <p>No pending clients found.</p>
                ) : (
                  <Table isStriped aria-label="Pending clients table">
                    <TableHeader>
                      <TableColumn>ID</TableColumn>
                      <TableColumn>Full Name</TableColumn>
                      <TableColumn>Address</TableColumn>
                      <TableColumn>Phone No.</TableColumn>
                      <TableColumn>Philhealth ID</TableColumn>
                      <TableColumn>Date Registered</TableColumn>
                      <TableColumn>Category</TableColumn>
                      <TableColumn>Actions</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {pendingClients.map((client: ClientTypes) => (
                        <TableRow key={client.id}>
                          <TableCell>{client.id}</TableCell>
                          <TableCell>{client.fname}</TableCell>
                          <TableCell>{client.address}</TableCell>
                          <TableCell>{client.phone_no}</TableCell>
                          <TableCell>{client.phil_id || "N/A"}</TableCell>
                          <TableCell>{new Date(client.date_registered).toLocaleDateString("en-US")}</TableCell>
                          <TableCell>{client.category_name}</TableCell>
                          <TableCell>
                            <Button
                              color="success"
                              size="sm"
                              onPress={() => handleActivateClient(client.id)}
                            >
                              Activate
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ManageClient;
