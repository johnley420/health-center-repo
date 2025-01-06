import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger, User } from "@nextui-org/react";
import { TfiAnnouncement } from "react-icons/tfi";
import { RiLogoutCircleRLine } from "react-icons/ri";

interface AvatarProps {
  unreadMessages: number;
  setUnreadMessages: (count: number) => void;
}

const Avatar: React.FC<AvatarProps> = ({ unreadMessages, setUnreadMessages }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  const firstName = sessionStorage.getItem("firstName") ?? "";
  const lastName = sessionStorage.getItem("lastName") ?? "";
  const profilePic = sessionStorage.getItem("profilePic")
    ? `http://localhost:8081/uploads/images/${sessionStorage.getItem("profilePic")}`
    : "/default-profile.png";

  // IMPORTANT: get the user role
  const role = sessionStorage.getItem("userRole") ?? "User";

  const receiverId = sessionStorage.getItem("id");

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = "/";
  };

  const handleAnnouncementClick = () => {
    const fetchMessages = async () => {
      try {
        // Mark all unread as read
        await fetch(`http://localhost:8081/updateMessagesToRead`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ receiver_id: receiverId }),
        });

        // Fetch updated messages
        const response = await fetch(
          `http://localhost:8081/getMessagesworker?receiver_id=${receiverId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data = await response.json();
        setMessages(data);
        setUnreadMessages(0); // Reset unread messages count
      } catch (error) {
        console.error("Error handling announcement click:", error);
      }
    };

    fetchMessages();
    setIsModalOpen(true);
  };

  return (
    <>
      <Popover placement="bottom" showArrow>
        <PopoverTrigger className="cursor-pointer relative">
          <div>
            <User
              name={<p className="text-lg font-semibold">{`${firstName} ${lastName}`}</p>}
              description={role}
              avatarProps={{
                src: profilePic,
              }}
            />
            {unreadMessages > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-center text-xs transform translate-x-1/2 -translate-y-1/2">
                {unreadMessages}
              </span>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent>
          <div className="px-3 py-4 flex flex-col items-start gap-5">
            {/* Show Announcement ONLY if role == "worker" */}
            {role === "worker" && (
              <div
                className="text-lg tracking-wider flex items-center justify-center gap-3 cursor-pointer"
                onClick={handleAnnouncementClick}
              >
                <TfiAnnouncement />
                Announcement
                {unreadMessages > 0 && (
                  <span className="bg-red-500 text-white rounded-full w-4 h-4 text-center text-xs ml-1">
                    {unreadMessages}
                  </span>
                )}
              </div>
            )}

            <div
              className="text-lg tracking-wider flex items-center justify-center gap-3 cursor-pointer"
              onClick={handleLogout}
            >
              <RiLogoutCircleRLine /> Logout
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Custom Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-5 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Announcements</h2>
            <div className="max-h-80 overflow-y-auto pr-1">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div key={msg.id} className="p-3 bg-slate-100 rounded-xl mb-2">
                    <p className="text-sm font-medium text-green-500">{msg.message}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p>No announcements available.</p>
              )}
            </div>

            <button
              className="bg-blue-500 text-white rounded-md px-4 py-2 mt-4"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Avatar;
