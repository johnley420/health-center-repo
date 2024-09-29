import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Select,
  SelectItem,
  Button,
} from "@nextui-org/react";
import { CategoryFilter, workerColumn } from "../../constants";
import { workersData } from "../../services/Data";
import { workerTypes } from "../../types";
import { IoSearch } from "react-icons/io5";
import { LuPencil } from "react-icons/lu";
import { FaRegTrashCan } from "react-icons/fa6";
import { MdLocationPin } from "react-icons/md";
import ViewWorkerForm from "../../components/modals/ViewWorkerForm";

const List = () => {
  const [isOpen,setIsOpen] = useState(false)
  return (
    <div className="w-full p-2">
      <div className="flex items-center justify-between w-full mb-7">
        <h1 className="text-3xl font-bold pl-3">Worker List</h1>
        <div className="flex items-center justify-center gap-5 max-w-xl w-full">
          {" "}
          <Input
            size="lg"
            label="Search"
            startContent={<IoSearch />}
            placeholder="Type to search..."
            className="w-[350px]"
          />
          <Select size="lg" label="Filter" className="w-[250px]">
            {CategoryFilter.map((items, index) => (
              <SelectItem key={index}>{items}</SelectItem>
            ))}
          </Select>
          <Button color="primary" size="lg" onClick={() => setIsOpen(true)}>
            Add worker
          </Button>
        </div>
      </div>
      <Table isStriped aria-label="Example static collection table">
        <TableHeader>
          {workerColumn.map((item, index) => (
            <TableColumn key={index} className="text-lg text-black py-4 pl-4">
              {item}
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {workersData?.map((user: workerTypes, index: number) => (
            <TableRow key={index}>
              <TableCell className="text-base text-black font-bold py-4 pl-4">
                {index + 1}.
              </TableCell>
              <TableCell className="text-base text-black py-4 pl-4">
                {user.firstName} {user.lastName}
              </TableCell>
              <TableCell className="text-base text-black py-4 pl-4">
                {user.age}
              </TableCell>
              <TableCell className="text-base text-black py-4 pl-4">
                {user.address}
              </TableCell>
              <TableCell className="text-base text-black py-4 pl-4">
                {user.sex}
              </TableCell>
              <TableCell className="text-base text-black py-4 pl-4">
                {user.birthdate}
              </TableCell>

              <TableCell className="text-base text-black py-4 pl-4">
                {user.placeAssigned}
              </TableCell>
              <TableCell className="text-base text-black py-4 pl-4">
                {user.username}
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
      <ViewWorkerForm isOpen={isOpen} onClose={() => setIsOpen(false)}  />
    </div>
  );
}

export default List
