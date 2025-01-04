import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input, Button } from "@nextui-org/react";
import { IoSend } from "react-icons/io5";
import { FaPhone } from "react-icons/fa6";
import { CategoryFilter } from "../../constants";
import Swal from "sweetalert2";

// Define the structure of the user data
interface User {
  id: number;
  fname: string;
  category_name: string;
  phone_no: string;
}

interface Message {
  message: string;
  date_send: string;
}

const Announcement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [smsMessage, setSmsMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  const workerId = sessionStorage.getItem("id");

  // Fetch user data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `https://https://health-center-repo-production.up.railway.app/clients?workerId=${workerId}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.statusText}`);
        }
        const data: User[] = await response.json();
        setUsers(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [workerId]);

  // Fetch stored SMS messages for a specific worker
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!workerId) {
          console.error("User ID not found in session storage");
          return;
        }

        const response = await axios.get("https://https://health-center-repo-production.up.railway.app/sms-messages", {
          params: { worker_id: workerId },
        });
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [workerId]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(event.target.value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.fname.toLowerCase().includes(searchTerm);
    const matchesCategory =
      categoryFilter === "All" || user.category_name === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...CategoryFilter];

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      const allUserIds = filteredUsers.map((user) => user.id);
      setSelectedUsers(allUserIds);
    }
    setSelectAll(!selectAll);
  };

  const handleUserSelection = (userId: number) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSendSms = async () => {
    if (!smsMessage.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Please enter a message to send.",
      });
      return;
    }

    const selectedPhoneNumbers = filteredUsers
      .filter((user) => selectedUsers.includes(user.id))
      .map((user) => user.phone_no)
      .join(",");

    if (!selectedPhoneNumbers) {
      Swal.fire({
        icon: "info",
        title: "No Recipients",
        text: "Please select at least one user to send the message.",
      });
      return;
    }

    try {
      const workerId = sessionStorage.getItem("id");
      if (!workerId) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "User ID not found in session storage.",
        });
        return;
      }

      await axios.post(
        "https://https://health-center-repo-production.up.railway.app/send-sms",
        {
          number: selectedPhoneNumbers,
          message: smsMessage,
          worker_id: workerId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Construct and add the new message to local state
      const newMessage = {
        message: smsMessage,
        date_send: new Date().toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);

      Swal.fire({
        icon: "success",
        title: "Message Sent",
        text: "Messages sent successfully!",
      });

      setSmsMessage(""); // Clear the input field
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error("Response data:", error.response.data);
          Swal.fire({
            icon: "error",
            title: "Server Error",
            text: "Failed to send SMS due to server error.",
          });
        } else if (error.request) {
          Swal.fire({
            icon: "error",
            title: "No Server Response",
            text: "Failed to send SMS. No response from the server.",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Network Error",
            text: "Failed to send SMS due to a network error.",
          });
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Unexpected Error",
          text: "An unexpected error occurred.",
        });
      }
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>Error loading users: {error}</p>;

  return (
    <div className="w-full min-h-screen">
      <h1 className="text-2xl font-bold pl-3 mb-9">ANNOUNCEMENTS</h1>

      <div className="flex flex-col md:flex-row gap-7 w-full bg-white rounded-xl overflow-hidden shadow-md border border-gray-100">
        {/* LEFT SIDE: CLIENT LIST & FILTERS */}
        <div className="w-full md:w-1/3 border-r md:h-screen overflow-y-auto rounded-xl bg-gray-100 px-4 py-7">
          <div className="flex flex-col items-start gap-3">
            {/* Search and Filter */}
            <div className="w-full flex gap-5 flex-col md:flex-row items-center justify-between bg-white p-3 rounded-xl">
              <Input
                label="Search..."
                className="w-full md:max-w-[250px]"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <select
                id="categoryFilter"
                value={categoryFilter}
                onChange={handleFilterChange}
                className="w-full sm:w-[200px] md:w-[250px] lg:w-[200px] h-[55px] px-4 py-2 bg-[#F4F4F5] border border-gray-300 rounded-md focus:outline-none text-[#92929A]"
              >
                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                    className="py-2 text-gray-800"
                  >
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Clients List */}
            <div className="bg-white shadow-md shadow-slate-100 borders rounded-xl p-4 mt-3 w-full h-full flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold mb-4">Clients List</h1>
                <Button onClick={handleSelectAll} color="primary">
                  {selectAll ? "Deselect All" : "Select All"}
                </Button>
              </div>

              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between gap-2 p-4 bg-slate-100 rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{index + 1}.</p>
                      <h1 className="text-base font-semibold">{user.fname}</h1>
                    </div>
                    <div className="flex items-center gap-5">
                      <h1 className="text-base font-semibold flex items-center gap-2">
                        <FaPhone />
                        {user.phone_no}
                      </h1>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserSelection(user.id)}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p>No clients found</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: SMS SENDING & MESSAGE HISTORY */}
        <div className="w-full md:w-2/3 rounded-xl flex flex-col py-7 px-4">
          <h1 className="text-2xl font-bold mb-7">Messages</h1>

          <div className="flex gap-5 items-center mt-7">
            <Input
              size="lg"
              type="text"
              label="Message"
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <button onClick={handleSendSms}>
              <IoSend size={30} className="text-green-500" />
            </button>
          </div>

          {/* Message history with a fixed height and scroll */}
          <div className="flex flex-col gap-5 mt-7 h-80 overflow-y-auto">
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div key={index} className="p-4 bg-gray-100 rounded-lg">
                  <p className="text-lg">{msg.message}</p>
                  <p className="text-sm text-gray-500">{msg.date_send}</p>
                </div>
              ))
            ) : (
              <p>No messages available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Announcement;
