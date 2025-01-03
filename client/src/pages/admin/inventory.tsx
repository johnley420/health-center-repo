import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import axios from "axios";
import FormData from "form-data";

import AddMedicineModal from "../../components/modals/add/AddMedicineForm";
import EditMedicineModal from "../../components/modals/update/EditMedicineForm";
import DeleteMedicineConfirm from "../../components/modals/DeleteMedicineConfirm";

import { Medicine } from "../../types";

const Inventory: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await axios.get("health-center-repo-production.up.railway.app/medicines");
      // The server might return { expiration_date: "...", ... }
      // Map to 'expirationDate' in our local state:
      const mapped = response.data.map((item: any) => ({
        ...item,
        expirationDate: item.expiration_date, // convert to camelCase
      }));
      setMedicines(mapped);
    } catch (error) {
      console.error("Error fetching medicines: ", error);
    }
  };

  // ------------------ ADD ------------------
  const handleAddMedicine = async (medicine: Omit<Medicine, "id">) => {
  try {
    const formData = new FormData();
    formData.append("name", medicine.name);
    formData.append("category", medicine.category);
    formData.append("quantity", medicine.quantity.toString());
    // If your server expects expiration_date, map it:
    formData.append("expirationDate", medicine.expirationDate); 
    // or formData.append("expiration_date", medicine.expirationDate);

    if (medicine.image instanceof File) {
      formData.append("image", medicine.image);
    }

    const response = await axios.post("health-center-repo-production.up.railway.app/medicines", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // The server typically returns { id, name, category, quantity, expiration_date, image }
    // So let's map it to a local Medicine object if needed:
    const newMedicine: Medicine = {
      id: response.data.id,
      name: response.data.name,
      category: response.data.category,
      quantity: response.data.quantity,
      // map 'expiration_date' -> 'expirationDate' if the server uses snake_case:
      expirationDate: response.data.expiration_date,
      image: response.data.image,
    };

    // Add to local state
    setMedicines((prev) => [...prev, newMedicine]);
  } catch (error) {
    console.error("Error adding medicine:", error);
  }
};

  // ------------------ EDIT ------------------
  const handleEditMedicine = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setIsEditModalOpen(true);
  };

  // ------------------ UPDATE ------------------
  const handleUpdateMedicine = async (updatedMedicine: Medicine) => {
  try {
    // Build FormData
    const formData = new FormData();
    formData.append("name", updatedMedicine.name);
    formData.append("category", updatedMedicine.category);
    formData.append("quantity", updatedMedicine.quantity.toString());

    // The server expects "expirationDate" or "expiration_date" 
    // (depending on your route). If your route is using:
    //    const { name, category, quantity, expirationDate } = req.body;
    // then do this:
    formData.append("expirationDate", updatedMedicine.expirationDate);

    // If the user uploaded a new file, handle it
    if (updatedMedicine.image instanceof File) {
      formData.append("image", updatedMedicine.image);
    }

    const response = await axios.put(
      `health-center-repo-production.up.railway.app/medicines/${updatedMedicine.id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    // The server likely returns something like:
    // {
    //   id, name, category, quantity, expiration_date, image
    // }
    const returnedData = response.data;

    // Map if needed (server -> client)
    const updatedInDB: Medicine = {
      id: returnedData.id,
      name: returnedData.name,
      category: returnedData.category,
      quantity: returnedData.quantity,
      // map 'expiration_date' -> 'expirationDate' if your server returns snake_case
      expirationDate: returnedData.expiration_date,
      image: returnedData.image,
    };

    // Update local state
    setMedicines((prev) =>
      prev.map((m) => (m.id === updatedInDB.id ? updatedInDB : m))
    );
    setIsEditModalOpen(false);
  } catch (error) {
    console.error("Error updating medicine:", error);
  }
};


  // ------------------ DELETE ------------------
  const handleDeleteMedicine = (id: number) => {
    // Find that medicine in your array:
    const med = medicines.find((m) => m.id === id) || null;
    setSelectedMedicine(med);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMedicine) return;
    try {
      await axios.delete(`health-center-repo-production.up.railway.app/medicines/${selectedMedicine.id}`);
      // Remove it from local state
      setMedicines((prev) => prev.filter((med) => med.id !== selectedMedicine.id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting medicine: ", error);
    }
  };

  // ------------------ FILTER SEARCH ------------------
  const filteredMedicines = medicines.filter((med) => {
    const lowerSearch = searchQuery.toLowerCase();
    return (
      med.name.toLowerCase().includes(lowerSearch) ||
      med.category.toLowerCase().includes(lowerSearch)
    );
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold pl-3">Medicine Inventory</h1>
      <div className="p-6 px-0 flex justify-between items-center ">
        <Input
          className="w-96"
          placeholder="Search by name or category"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button color="primary" onPress={() => setIsAddModalOpen(true)}>
          Add Medicine
        </Button>
      </div>

      {/* ADD MEDICINE MODAL */}
      <AddMedicineModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddMedicine}
      />

      <Table isStriped aria-label="Inventory of Medicines">
        <TableHeader>
          <TableColumn>Image</TableColumn>
          <TableColumn>Name</TableColumn>
          <TableColumn>Category</TableColumn>
          <TableColumn>Quantity</TableColumn>
          <TableColumn>Expiration Date</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
  {filteredMedicines.map((medicine) => (
    <TableRow key={medicine.id}>
      <TableCell>
        {typeof medicine.image === "string" && (
          <img
            src={`health-center-repo-production.up.railway.app/uploads/images/${medicine.image}`}
            alt={medicine.name}
            className="w-20"
          />
        )}
      </TableCell>
      <TableCell>{medicine.name}</TableCell>
      <TableCell>{medicine.category}</TableCell>
      <TableCell>{medicine.quantity}</TableCell>
      {/* Format expiration date */}
      <TableCell>
        {new Date(medicine.expirationDate).toLocaleDateString("en-US")}
      </TableCell>
      <TableCell>
        <Button
          color="warning"
          className="mr-4"
          onPress={() => handleEditMedicine(medicine)}
        >
          Edit
        </Button>
        <Button
          color="danger"
          onPress={() => handleDeleteMedicine(medicine.id!)}
        >
          Delete
        </Button>
      </TableCell>
    </TableRow>
  ))}
</TableBody>

      </Table>

      {/* EDIT MEDICINE MODAL */}
      {selectedMedicine && (
        <EditMedicineModal
          medicine={selectedMedicine}
          visible={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdateMedicine}
        />
      )}

      {/* DELETE CONFIRMATION */}
      <DeleteMedicineConfirm
        visible={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Inventory;
