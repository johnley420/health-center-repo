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
import { CategoryFilter, clientColumn } from "../../constants";
import { clientData } from "../../services/Data";
import { IoSearch } from "react-icons/io5";

const ViewCateoryTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { categoryField } = useCategoryStore();
  const navigate = useNavigate();
  console.log(categoryField);

  const { category, data, fields } = categoryField;

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

  // useEffect(() => {
  //   if (!categoryField.category || !categoryField.data || categoryField.fields)
  //     navigate("/medication");
  // }, []);
  return (
    <div className="w-full p-2">
      <div className="flex items-center justify-between w-full mb-7">
        <h1 className="text-3xl font-bold pl-3">Pregnant List</h1>
        <div className="flex items-center justify-center gap-5 max-w-xl w-full">
          <Input
            size="lg"
            label="Search"
            startContent={<IoSearch />}
            placeholder="Type to search..."
            className="w-[350px]"
            value={searchQuery} // Bind the input value to state
            onChange={handleSearch} // Update the search query on change
          />
          <Select size="lg" label="Filter" className="w-[250px]">
            {CategoryFilter.map((items, index) => (
              <SelectItem key={index}>{items}</SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <Table isStriped aria-label="Example static collection table">
        <TableHeader>
          {fields.map((item, index) => (
            <TableColumn key={index} className="text-lg text-black py-4 pl-4">
              {item}
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {filteredClients?.map((user: clientTypes, index: number) => (
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
                <button>
                  <MdLocationPin size={24} className="text-yellow-500" />
                </button>
                <button>
                  <FaRegTrashCan size={22} className="text-red-500" />
                </button>
                <button>
                  <LuPencil size={24} className="text-green-500" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ViewCateoryTable;
