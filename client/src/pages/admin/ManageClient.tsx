import React, { ChangeEvent, useState } from "react";
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
import {
  CategoryFilter,
  clientColumn,
  clientInputFields,
} from "../../constants";
import { clientData } from "../../services/Data";
import { clientTypes } from "../../types";
import { IoSearch } from "react-icons/io5";
import { LuPencil } from "react-icons/lu";
import { FaRegTrashCan } from "react-icons/fa6";
import { MdLocationPin } from "react-icons/md";
import AddClient from "../../components/modals/AddClient";
import { NavLink } from "react-router-dom";
import { FiEye } from "react-icons/fi";
import ViewCLientInfo from "../../components/modals/ViewCLientInfo";
import UpdateClient from "../../components/modals/UpdateClient";

const ManageClient = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpenAdd, setIsOpenAdd] = useState<boolean>(false);
  const [isOpenvVew, setIsOpenView] = useState<boolean>(false);
  const [isOpenUpdate, setIsOpenUpdate] = useState<boolean>(false);

  const [formData, setFormData] = useState<any>({});
  const [clientInfo, setClientInfo] = useState<any>({
    name: "",
    address: "",
    phone: "",
    philhealthId: "",
    birthday: "",
    dateRegistered: "",
  });

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredClients = clientData.filter(
    (user: clientTypes) =>
      user.name.toLowerCase().includes(searchQuery) ||
      user.address.toLowerCase().includes(searchQuery) ||
      user.phone.toLowerCase().includes(searchQuery) ||
      user.philhealthId.toLowerCase().includes(searchQuery)
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {};
  const handleSubmit = (FormData: FormData) => {
    console.log("dd", clientInfo);
  };
  console.log("dd", clientInfo);
  return (
    <div className="w-full p-2">
      <div className="flex items-center justify-between w-full mb-7">
        <h1 className="text-3xl font-bold pl-3">BHW List</h1>
        <div className="flex items-center justify-center gap-5 max-w-xl w-full">
          <Input
            size="md"
            label="Search"
            startContent={<IoSearch />}
            placeholder="Type to search..."
            className="w-[350px]"
            value={searchQuery} // Bind the input value to state
            onChange={handleSearch} // Update the search query on change
          />
          <Select size="md" label="Filter" className="w-[250px]">
            {CategoryFilter.map((items, index) => (
              <SelectItem key={index}>{items}</SelectItem>
            ))}
          </Select>
          <Button color="primary" size="lg" onClick={() => setIsOpenAdd(true)}>
            Add
          </Button>
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
                <NavLink to="/view-map">
                  <MdLocationPin size={24} className="text-yellow-500" />
                </NavLink>
                <button
                  onClick={() => {
                    setClientInfo(user);
                    setIsOpenView(true);
                  }}
                >
                  <FiEye size={24} className="text-sky-500" />
                </button>
                <button
                  onClick={() => {
                    setClientInfo(user);
                    setIsOpenUpdate(true);
                  }}
                >
                  <LuPencil size={24} className="text-green-500" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {isOpenAdd && (
        <AddClient
          isOpen={isOpenAdd}
          onClose={() => setIsOpenAdd(false)}
          fields={
            clientInputFields.find((item) => item.category === "Pregnant")
              ?.inputFields
          }
        />
      )}
      {isOpenvVew && (
        <ViewCLientInfo
          isOpen={isOpenvVew}
          onClose={() => setIsOpenView(false)}
          data={clientInfo}
        />
      )}
      {isOpenUpdate && (
        <UpdateClient
          isOpen={isOpenUpdate}
          onClose={() => setIsOpenUpdate(false)}
          data={clientInfo}
        />
      )}
    </div>
  );
};

export default ManageClient;
