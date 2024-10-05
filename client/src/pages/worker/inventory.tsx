import React from "react";
import { useState } from "react";
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
import AddMedicineForm from "../../components/modals/add/AddMedicineForm";
import DeleteMedicineConfirm from "../../components/modals/DeleteMedicineConfirm";
import { dummyMedicines } from "../../constants";
import { Medicine } from "../../types";
import EditMedicineModal from "../../components/modals/update/EditMedicineForm";

const Inventory: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>(dummyMedicines);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleAddMedicine = (medicine: Medicine) => {
    setMedicines([...medicines, medicine]);
  };

  const handleEditMedicine = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setIsEditModalOpen(true);
  };

  const handleDeleteMedicine = (id: number) => {
    setSelectedMedicine(medicines.find((med) => med.id === id) || null);
    setIsDeleteModalOpen(true);
  };

  const handleUpdateMedicine = (updatedMedicine: Medicine) => {
    setMedicines(
      medicines.map((med) =>
        med.id === updatedMedicine.id ? updatedMedicine : med
      )
    );
  };

  const handleConfirmDelete = () => {
    setMedicines(
      medicines.filter((med) => med.id !== (selectedMedicine?.id || 0))
    );
    setIsDeleteModalOpen(false);
  };

  const filteredMedicines = medicines.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold pl-3">Medicine Inventory</h1>
      <div className="p-6 px-0 flex justify-between items-center ">
        <Input
          className="w-96"
          placeholder="Search by name or category"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button color="primary" onClick={() => setIsAddModalOpen(true)}>
          Add Medicine
        </Button>
      </div>
      <AddMedicineForm
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddMedicine}
      />
      <Table isStriped aria-label="Inventory of Medicines">
        <TableHeader>
          <TableColumn>Images</TableColumn>
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
                {<img src={medicine.image} className="w-20" />}
              </TableCell>
              <TableCell>{medicine.name}</TableCell>
              <TableCell>{medicine.category}</TableCell>
              <TableCell>{medicine.quantity}</TableCell>
              <TableCell>{medicine.expirationDate}</TableCell>
              <TableCell>
                <Button
                  color="warning"
                  className="mr-4"
                  onClick={() => handleEditMedicine(medicine)}
                >
                  Edit
                </Button>
                <Button
                  color="danger"
                  onClick={() => handleDeleteMedicine(medicine.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedMedicine && (
        <EditMedicineModal
          medicine={selectedMedicine}
          visible={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdateMedicine}
        />
      )}
      <DeleteMedicineConfirm
        visible={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Inventory;
