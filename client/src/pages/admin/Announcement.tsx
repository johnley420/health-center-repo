import { Avatar, Input } from "@nextui-org/react";
import React from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { IoAddOutline, IoSend } from "react-icons/io5";

const Announcement = () => {
  return (
    <div className="w-full h-screen ">
      <h1 className="text-2xl font-bold pl-3 mb-9">ANNOUNCEMENTS</h1>

      <div className="flex gap-7 w-full h-[750px] bg-white rounded-xl overflow-hidden shadow-md border border-gray-100">
        <div className="w-1/3  border-r h-full rounded-xl bg-gray-100 px-4 py-7">
          <div className="flex flex-col items-start gap-3">
            <h1 className="text-xl font-bold ">Recent Clients</h1>
            <div className="flex items-center justify-between w-full px-3">
              {Array.from({ length: 7 }, (_, i) => {
                return (
                  <Avatar
                    size="lg"
                    src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
                  />
                );
              })}
            </div>
            <div className="bg-white shadow-md shadow-slate-100 borders rounded-xl p-4 mt-3 w-full h-full flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold mb-4">Clients List</h1>
                <button className="text-white text-sm font-medium py-2 px-7 rounded-full bg-green-500">
                  Select All
                </button>
              </div>
              {Array.from({ length: 7 }, (_, i) => {
                return (
                  <div className="flex items-center justify-between gap-2 p-4 bg-slate-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
                      <h1 className="text-base font-semibold font-medium">
                        Juan Dela Cruz
                      </h1>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="bg-green-500 rounded-full p-2">
                        <IoAddOutline size={15} className="text-white" />
                      </button>
                      <button>
                        <FaRegTrashCan size={22} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="w-2/3 rounded-xl flex flex-col justify-end h-full py-7 px-4">
          <h1 className="text-2xl font-bold  mb-7">Messages</h1>

          <div className="flex flex-col gap-5 h-[600px]  overflow-y-auto scrolless">
            {Array.from({ length: 7 }, (_, i) => {
              return (
                <div className="p-5 bg-slate-100 rounded-xl">
                  <p className="text-sm font-medium text-green-500">
                    {" "}
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Ullam minus consequuntur fuga ut pariatur totam doloremque,
                    libero incidunt accusantium est?
                  </p>
                </div>
              );
            })}
          </div>
          <div className="flex gap-5 items-center mt-7">
            <Input
              size="lg"
              type="text"
              label="Message"
              placeholder="Type Anything...."
              className="flex-1"
            />
            <button>
              <IoSend size={30} className="text-green-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Announcement;
