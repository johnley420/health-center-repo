import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
} from "@nextui-org/react";
import { clientColumn } from "../../constants";
import { clientData } from "../../services/Data";
import { clientTypes } from "../../types";
import { IoSearch } from "react-icons/io5";

const userData: any = [];

const ManageClient = () => {
  return (
    <div className="w-full p-2">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-3xl font-bold mb-5 pl-3">Client list</h1>
        <Input
          label="Search"
          startContent={<IoSearch />}
          placeholder="Type to search..."
          className="max-w-lg"
        />
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
              <TableCell className="text-base text-black py-4 pl-4">
                {user.address}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ManageClient;
