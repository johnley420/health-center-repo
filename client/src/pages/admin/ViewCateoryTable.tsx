import React, { useEffect, useState } from "react";
import { clientTypes } from "../../types/index";
import {
  Input,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";

import { useCategoryStore } from "../../components/store";
import { IoSearch } from "react-icons/io5";
import ViewMedicationForm from "../../components/modals/ViewMedicationForm";

const ViewCateoryTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { categoryField } = useCategoryStore();

  const { category, data } = categoryField;

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredClients = data.filter(
    (user: clientTypes) =>
      user.name.toLowerCase().includes(searchQuery) ||
      user.address.toLowerCase().includes(searchQuery) ||
      user.phone.toLowerCase().includes(searchQuery) ||
      user.philhealthId.toLowerCase().includes(searchQuery)
  );

  return (
    <div className="w-full p-2">
      <div className="flex items-center justify-between w-full mb-7">
        <h1 className="text-3xl font-bold pl-3">{category} List</h1>
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

      <Table isStriped aria-label="Example static collection table">
        <TableHeader>
          <TableColumn className="text-lg text-black py-4 pl-4">
            No.
          </TableColumn>
          <TableColumn className="text-lg text-black py-4 pl-4">
            Name
          </TableColumn>
          <TableColumn className="text-lg text-black py-4 pl-4">
            Address
          </TableColumn>
          <TableColumn className="text-lg text-black py-4 pl-4">
            Phone No.
          </TableColumn>
          <TableColumn className="text-lg text-black py-4 pl-4">
            Birthday
          </TableColumn>
          <TableColumn className="text-lg text-black py-4 pl-4">
            Philhealth
          </TableColumn>
          <TableColumn className="text-lg text-black py-4 pl-4">
            Date of Registered
          </TableColumn>
        </TableHeader>
        <TableBody>
          {filteredClients?.map((user: clientTypes, index: number) => (
            <TableRow
              onClick={() => setIsOpen(true)}
              key={index}
              className="hover:border-b cursor-pointer duration-300 ease-in-out"
            >
              <TableCell className="text-base text-black font-bold py-4 pl-4 ">
                {index + 1}.
              </TableCell>
              <TableCell className="text-base text-black py-4 pl-4">
                {user.name}
              </TableCell>
              <TableCell className="text-base text-black py-4 pl-4">
                {user.address}
              </TableCell>
              <TableCell className="text-base text-black py-4 pl-4">
                {user.phone}
              </TableCell>
              <TableCell className="text-base text-black py-4 pl-4">
                {user.birth}
              </TableCell>
              <TableCell className="text-base text-black py-4 pl-4">
                {user.philhealthId}
              </TableCell>
              <TableCell className="text-base text-black py-4 pl-4">
                {user.dateRegistered}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ViewMedicationForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        medicationType={category}
      />
    </div>
  );
};

export default ViewCateoryTable;
