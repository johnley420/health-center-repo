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
import { MdLocationPin } from "react-icons/md";
import { FaRegTrashCan } from "react-icons/fa6";
import { LuPencil } from "react-icons/lu";
import { useCategoryStore } from "../../components/store";
import { useNavigate } from "react-router-dom";
import { basicInfoField } from "../../constants";
import { clientData } from "../../services/Data";
import { IoSearch } from "react-icons/io5";
import ViewMedicationForm from "../../components/modals/view/ViewMedicationForm";

const ViewCateoryTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { categoryField } = useCategoryStore();
  const navigate = useNavigate();
  console.log(categoryField);

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

  const test = ["no", "name"];
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
          {basicInfoField.map((item: string, index: number) => (
            <TableColumn key={index} className="text-lg text-black py-4 pl-4">
              {item}
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {filteredClients?.map((user: clientTypes, index: number) =>
            test.map((t, i) => (
              <TableRow key={index}>
                <TableCell className="text-base text-black font-bold py-4 pl-4">
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
                <TableCell className="text-base text-black py-4 pl-4 flex items-center gap-5">
                  <button
                    onClick={() => {
                      setIsOpen(true);
                    }}
                    className="text-xs text-white font-medium py-2 px-4 rounded-full bg-green-500"
                  >
                    Add Form
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <ViewMedicationForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        medicationType={category}
        data={[]}
      />
    </div>
  );
};

export default ViewCateoryTable;
