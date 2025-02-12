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
import { MdLocationPin, MdWarning } from "react-icons/md"; // Added MdWarning import
import AddClient from "../../components/modals/add/AddClient"; // Ensure this path is correct
import { useNavigate } from "react-router-dom";
import ViewCLientInfo from "../../components/modals/view/ViewCLientInfo"; // Ensure this path is correct
import UpdateClient from "../../components/modals/update/UpdateClient"; // Ensure this path is correct
import { CategoryFilter, clientColumn } from "../../constants"; // Ensure this path is correct
import axios from "axios"; // Import axios for API calls
import Swal from "sweetalert2"; // Import SweetAlert2

// Define ClientTypes (updated to include updated_at and condition_status)
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
  updated_at?: string; // For warning functionality
  condition_status?: string; // Field for client's condition
};

const ManageClient = () => {
  const navigate = useNavigate();
  
  // State variables for filters and modals
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [isOpenAdd, setIsOpenAdd] = useState<boolean>(false);
  const [isOpenView, setIsOpenView] = useState<boolean>(false);
  const [isOpenUpdate, setIsOpenUpdate] = useState<boolean>(false);
  const [clientInfo, setClientInfo] = useState<ClientTypes | undefined>();
  
  // State variables for client data
  const [clientData, setClientData] = useState<ClientTypes[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // States for Pending Clients
  const [isOpenPending, setIsOpenPending] = useState<boolean>(false);
  const [pendingClients, setPendingClients] = useState<ClientTypes[]>([]);
  const [loadingPending, setLoadingPending] = useState<boolean>(false);
  const [errorPending, setErrorPending] = useState<string | null>(null);

  // States for Removed Clients
  const [isOpenRemoved, setIsOpenRemoved] = useState<boolean>(false);
  const [removedClients, setRemovedClients] = useState<ClientTypes[]>([]);
  const [loadingRemoved, setLoadingRemoved] = useState<boolean>(false);
  const [errorRemoved, setErrorRemoved] = useState<string | null>(null);

  // NEW: States for Warning (Not Updated) Clients
  const [isOpenWarning, setIsOpenWarning] = useState<boolean>(false);
  const [warningClients, setWarningClients] = useState<ClientTypes[]>([]);
  const [loadingWarning, setLoadingWarning] = useState<boolean>(false);
  const [errorWarning, setErrorWarning] = useState<string | null>(null);

  // NEW: State for the "update condition" modal and the condition value
  const [isOpenConditionUpdate, setIsOpenConditionUpdate] = useState<boolean>(false);
  const [conditionValue, setConditionValue] = useState<string>("");

  // Retrieve workerId from session storage
  const workerId = sessionStorage.getItem("id");

  // Fetch active clients from the server
  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://health-center-repo-production.up.railway.app/clients`, {
        params: {
          workerId: workerId,
          status: 'Active',
        },
      });
      setClientData(response.data);
    } catch (error: any) {
      console.error("Error fetching clients:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending clients from the server
  const fetchPendingClients = async () => {
    setLoadingPending(true);
    try {
      const response = await axios.get(`https://health-center-repo-production.up.railway.app/pending-clients`, {
        params: { workerId: workerId },
      });
      setPendingClients(response.data);
    } catch (error: any) {
      console.error("Error fetching pending clients:", error.message);
      setErrorPending(error.message);
    } finally {
      setLoadingPending(false);
    }
  };

  // Fetch removed clients from the server
  const fetchRemovedClients = async () => {
    setLoadingRemoved(true);
    try {
      const response = await axios.get(`https://health-center-repo-production.up.railway.app/clients`, {
        params: {
          workerId: workerId,
          status: 'Inactive',
        },
      });
      setRemovedClients(response.data);
    } catch (error: any) {
      console.error("Error fetching removed clients:", error.message);
      setErrorRemoved(error.message);
    } finally {
      setLoadingRemoved(false);
    }
  };

  // NEW: Fetch not updated clients from the server (using worker_id as parameter)
  const fetchWarningClients = async () => {
    setLoadingWarning(true);
    try {
      const response = await axios.get(`https://health-center-repo-production.up.railway.app/clients/not-updated`, {
        params: { worker_id: workerId },
      });
      setWarningClients(response.data);
    } catch (error: any) {
      console.error("Error fetching not updated clients:", error.message);
      setErrorWarning(error.message);
    } finally {
      setLoadingWarning(false);
    }
  };

  // NEW: Handler for opening the full update modal for a client.
  // This handler ensures that if updated_at is missing or invalid, we set a fallback value.
  const handleEditClient = (client: ClientTypes) => {
    const updatedClient = { ...client };
    if (!updatedClient.updated_at || isNaN(new Date(updatedClient.updated_at).getTime())) {
      updatedClient.updated_at = "";
    }
    setClientInfo(updatedClient);
    setIsOpenUpdate(true);
  };

  useEffect(() => {
    if (workerId) {
      fetchClients();
    }
  }, [workerId]);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  // Handle category filter changes
  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(event.target.value);
  };

  // Handle deleting (marking as inactive) a client
  const handleDeleteClient = async (clientId: number) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;
    try {
      const response = await axios.put(`https://health-center-repo-production.up.railway.app/clients/${clientId}/status`, {
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

  // Handle activating a pending client
  const handleActivateClient = async (clientId: number) => {
    if (!window.confirm("Are you sure you want to activate this client?")) return;
    try {
      const response = await axios.put(`https://health-center-repo-production.up.railway.app/clients/${clientId}/status`, {
        status: "Active",
      });
      if (response.status === 200) {
        setPendingClients((prevData) => prevData.filter((client) => client.id !== clientId));
        fetchClients();
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

  // Handle restoring a removed client
  const handleRestoreClient = async (clientId: number) => {
    if (!window.confirm("Are you sure you want to restore this client?")) return;
    try {
      const response = await axios.put(`https://health-center-repo-production.up.railway.app/clients/${clientId}/status`, {
        status: "Active",
      });
      if (response.status === 200) {
        setRemovedClients((prevData) => prevData.filter((client) => client.id !== clientId));
        fetchClients();
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Client has been restored to active status.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to restore client.',
        });
      }
    } catch (error: any) {
      console.error("Error restoring client:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to restore client.',
      });
    }
  };

  // Filter active clients based on search term and category
  const filteredClients = clientData.filter((client: ClientTypes) => {
    const matchesSearch = client.fname.toLowerCase().includes(searchTerm);
    const matchesCategory = categoryFilter === "All" || client.category_name === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...CategoryFilter];

  // Handle clicking on the map icon to view client location
  const handleMapClick = (client: ClientTypes) => {
    navigate("/view-map", {
      state: { clientId: client.id, latitude: client.latitude, longitude: client.longitude },
    });
  };

  // NEW: Handler for updating the condition (only) for a client using a separate server endpoint
  const handleUpdateCondition = async (onClose: () => void) => {
    try {
      const response = await axios.post(`https://health-center-repo-production.up.railway.app/update-client-condition`, {
        id: clientInfo?.id,
        condition: conditionValue,
      });
      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Condition updated successfully',
        });
        // Optionally refresh the client list
        fetchClients();
        onClose();
        setIsOpenConditionUpdate(false);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update condition',
        });
      }
    } catch (error: any) {
      console.error("Error updating condition:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update condition',
      });
    }
  };

  if (loading) return <p>Loading clients...</p>;
  if (error) return <p>Error loading clients: {error}</p>;

  return (
    <div className="w-full p-2">
      {/* Header with Add, Pending, Removed, and NEW Warning Button */}
      <div className="flex flex-col md:flex-row flex-wrap gap-5 md:items-center md:justify-between w-full mb-7">
        <h1 className="text-3xl font-bold pl-3">Client List</h1>
        <div className="flex flex-wrap items-center justify-start gap-5 w-full">
          {/* Search Bar Wrapper */}
          <div className="flex-1">
            <Input
              size="md"
              label="Search"
              startContent={<IoSearch />}
              placeholder="Type to search..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          {/* Filter Dropdown */}
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

          {/* Add Button */}
          <Button color="primary" size="lg" onPress={() => setIsOpenAdd(true)}>
            Add
          </Button>

          {/* Pending Clients Button */}
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

          {/* Removed Clients Button */}
          <Button
            color="warning"
            size="lg"
            onPress={() => {
              setIsOpenRemoved(true);
              fetchRemovedClients();
            }}
          >
            Archived
          </Button>

          {/* NEW: Warning (Not Updated) Clients Button */}
          <Button
            color="danger"
            size="lg"
            onPress={() => {
              setIsOpenWarning(true);
              fetchWarningClients();
            }}
          >
            <MdWarning size={24} />
          </Button>
        </div>
      </div>

      {/* Active Clients Table */}
      <div className="overflow-x-auto">
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
                <TableCell className="text-base text-black font-bold py-4 pl-4">
                  {index + 1}.
                </TableCell>
                <TableCell className="text-base text-black py-4 pl-4">{client.fname}</TableCell>
                <TableCell className="text-base text-black py-4 pl-4">{client.address}</TableCell>
                <TableCell className="text-base text-black py-4 pl-4">{client.phone_no}</TableCell>
                <TableCell className="text-base text-black py-4 pl-4">{client.phil_id || "N/A"}</TableCell>
                <TableCell className="text-base text-black py-4 pl-4">
                  {new Date(client.date_registered).toLocaleDateString("en-US")}
                </TableCell>
                <TableCell className="text-base text-black py-4 pl-4 flex items-center gap-5">
                  {/* Map Icon */}
                  <button onClick={() => handleMapClick(client)}>
                    <MdLocationPin size={24} className="text-yellow-500" />
                  </button>
                  {/* Edit Icon */}
                  <button onClick={() => handleEditClient(client)}>
                    <LuPencil size={24} className="text-green-500" />
                  </button>
                  {/* Delete Icon */}
                  <button onClick={() => handleDeleteClient(client.id)}>
                    <FaRegTrashCan size={24} className="text-red-500" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modals for Adding, Viewing, and Updating Clients */}
      {isOpenAdd && <AddClient isOpen={isOpenAdd} onClose={() => setIsOpenAdd(false)} />}
      {isOpenView && (
        <ViewCLientInfo isOpen={isOpenView} onClose={() => setIsOpenView(false)} data={clientInfo} />
      )}
      {isOpenUpdate && (
        <UpdateClient
          isOpen={isOpenUpdate}
          onClose={() => setIsOpenUpdate(false)}
          data={clientInfo}
          onUpdate={fetchClients}
        />
      )}

      {/* Pending Clients Modal */}
      <Modal
        closeButton
        aria-labelledby="modal-title-pending"
        isOpen={isOpenPending}
        onOpenChange={(open) => setIsOpenPending(open)}
        size="full"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div id="modal-title-pending" style={{ fontSize: "18px", fontWeight: "bold" }}>
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
                  <div className="overflow-x-auto">
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
                  </div>
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

      {/* Removed Clients Modal */}
      <Modal
        closeButton
        aria-labelledby="modal-title-removed"
        isOpen={isOpenRemoved}
        onOpenChange={(open) => setIsOpenRemoved(open)}
        size="full"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div id="modal-title-removed" style={{ fontSize: "18px", fontWeight: "bold" }}>
                  Archived Clients
                </div>
              </ModalHeader>
              <ModalBody>
                {loadingRemoved ? (
                  <p>Loading removed clients...</p>
                ) : errorRemoved ? (
                  <p>Error loading removed clients: {errorRemoved}</p>
                ) : removedClients.length === 0 ? (
                  <p>No removed clients found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table isStriped aria-label="Removed clients table">
                      <TableHeader>
                        <TableColumn>ID</TableColumn>
                        <TableColumn>Full Name</TableColumn>
                        <TableColumn>Address</TableColumn>
                        <TableColumn>Phone No.</TableColumn>
                        <TableColumn>Philhealth ID</TableColumn>
                        <TableColumn>Date Registered</TableColumn>
                        <TableColumn>Category</TableColumn>
                        <TableColumn>Action</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {removedClients.map((client: ClientTypes) => (
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
                                onPress={() => handleRestoreClient(client.id)}
                              >
                                Restore
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
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

      {/* NEW: Warning (Not Updated) Clients Modal */}
      <Modal
        closeButton
        aria-labelledby="modal-title-warning"
        isOpen={isOpenWarning}
        onOpenChange={(open) => setIsOpenWarning(open)}
        size="full"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div id="modal-title-warning" style={{ fontSize: "18px", fontWeight: "bold" }}>
                  Clients Not Updated in 3 Months
                </div>
              </ModalHeader>
              <ModalBody>
                {loadingWarning ? (
                  <p>Loading not updated clients...</p>
                ) : errorWarning ? (
                  <p>Error loading not updated clients: {errorWarning}</p>
                ) : warningClients.length === 0 ? (
                  <p>No clients found that haven't been updated in 3 months.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table isStriped aria-label="Not Updated clients table">
                      <TableHeader>
                        <TableColumn>ID</TableColumn>
                        <TableColumn>Full Name</TableColumn>
                        <TableColumn>Address</TableColumn>
                        <TableColumn>Phone No.</TableColumn>
                        <TableColumn>Philhealth ID</TableColumn>
                        <TableColumn>Date Registered</TableColumn>
                        <TableColumn>Last Updated</TableColumn>
                        <TableColumn>Category</TableColumn>
                        <TableColumn>Action</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {warningClients.map((client: ClientTypes) => (
                          <TableRow key={client.id}>
                            <TableCell>{client.id}</TableCell>
                            <TableCell>{client.fname}</TableCell>
                            <TableCell>{client.address}</TableCell>
                            <TableCell>{client.phone_no}</TableCell>
                            <TableCell>{client.phil_id || "N/A"}</TableCell>
                            <TableCell>{new Date(client.date_registered).toLocaleDateString("en-US")}</TableCell>
                            <TableCell>{client.updated_at ? new Date(client.updated_at).toLocaleDateString("en-US") : "N/A"}</TableCell>
                            <TableCell>{client.category_name}</TableCell>
                            <TableCell className="text-base text-black py-4 pl-4 flex items-center gap-5">
                              {/* NEW: Edit icon for condition update only using dropdown */}
                              <button
                                onClick={() => {
                                  setClientInfo(client);
                                  setConditionValue(client.condition_status || "");
                                  setIsOpenConditionUpdate(true);
                                }}
                              >
                                <LuPencil size={24} className="text-green-500" />
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
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

      {/* NEW: Modal for updating the client's condition only using a dropdown */}
      {isOpenConditionUpdate && (
        <Modal closeButton isOpen={isOpenConditionUpdate} onOpenChange={setIsOpenConditionUpdate} size="sm">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  <div style={{ fontSize: "18px", fontWeight: "bold" }}>Update Condition</div>
                </ModalHeader>
                <ModalBody>
                  {/* Dropdown for condition options */}
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    value={conditionValue}
                    onChange={(e) => setConditionValue(e.target.value)}
                  >
                    <option value="Permanent Residence">Permanent Residence</option>
                    <option value="Temporary">Temporary</option>
                    <option value="Deceased">Deceased</option>
                    <option value="Transfer">Transfer</option>
                  </select>
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" onPress={() => handleUpdateCondition(onClose)}>
                    Update
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </div>
  );
};

export default ManageClient;
