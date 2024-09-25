import React from "react";
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
} from "@nextui-org/react";
import { CategoryFilter, clientColumn } from "../../constants";
import { clientData } from "../../services/Data";
import { clientTypes } from "../../types";
import { IoSearch } from "react-icons/io5";
import { LuPencil } from "react-icons/lu";
import { FaRegTrashCan } from "react-icons/fa6";
import { MdLocationPin } from "react-icons/md";

const userData: any = [];

const ManageClient = () => {
  return (
    <div className="w-full p-2">
      <div className="flex items-center justify-between w-full mb-7">
        <h1 className="text-3xl font-bold pl-3">BHW List</h1>
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
        </div>
      </div>
      <Table isStriped aria-label="Example static collection table">
        <TableHeader>
          {clientColumn.map((item, index) => (
            <TableColumn key={index} className="text-lg text-black py-4 pl-4">
              {item}
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {clientData?.map((user: clientTypes, index: number) => (
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

export default ManageClient;
