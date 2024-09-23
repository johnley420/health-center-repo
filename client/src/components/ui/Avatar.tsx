import React from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  User,
} from "@nextui-org/react";
import { LuUser2 } from "react-icons/lu";
import { TfiAnnouncement } from "react-icons/tfi";
import { RiLogoutCircleRLine } from "react-icons/ri";

const Avatar = () => {
  return (
    <Popover placement="bottom" showArrow={true}>
      <PopoverTrigger className="cursor-pointer">
        <User
          name={<p className="text-lsg font-semibold ">Jane Doe</p>}
          description="Administrator"
          avatarProps={{
            src: "https://i.pravatar.cc/150?u=a04258114e29026702d",
          }}
        />
      </PopoverTrigger>
      <PopoverContent>
        <div className="px-3 py-4 flex flex-col items-start gap-5">
          <div className="text-lg  tracking-wider flex items-center justify-center gap-3">
            <LuUser2 />
            Profile
          </div>
          <div className="text-lg  tracking-wider flex items-center justify-center gap-3">
            <TfiAnnouncement />
            Announcement
          </div>
          <div className="text-lg  tracking-wider flex items-center justify-center gap-3">
            <RiLogoutCircleRLine /> Logout
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Avatar;
