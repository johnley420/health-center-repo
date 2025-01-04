import React, { useEffect, useState } from "react";
import { Input, Tabs, Tab } from "@nextui-org/react";
import { IoSend } from "react-icons/io5";
import axios from "axios";
import io, { Socket } from "socket.io-client";
import Swal from "sweetalert2"; // <-- Import SweetAlert2

type Worker = {
  id: number;
  first_name: string;
  last_name: string;
};

type Message = {
  id: number;
  message: string;
  sender: string;
  timestamp: string;
};

const Announcement: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [smsMessages, setSmsMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
  const [smsNumber, setSmsNumber] = useState("");

  const socket: Socket = io("https://https://health-center-repo-production.up.railway.app", { autoConnect: false });

  useEffect(() => {
    socket.connect();

    const fetchWorkers = async () => {
      try {
        const response = await axios.get("https://https://health-center-repo-production.up.railway.app/getWorkers");
        setWorkers(response.data);
      } catch (error) {
        console.error("Error fetching workers:", error);
      }
    };

    const fetchMessages = async () => {
      try {
        const response = await axios.get("https://https://health-center-repo-production.up.railway.app/getMessages");
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchWorkers();
    fetchMessages();
    fetchSmsMessages();

    // Listen for new announcements via socket
    socket.on("newAnnouncement", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("newAnnouncement");
      socket.disconnect();
    };
  }, []);

  const fetchSmsMessages = async () => {
    try {
      const response = await axios.get("https://https://health-center-repo-production.up.railway.app/getSmsMessages");
      setSmsMessages(response.data);
    } catch (error) {
      console.error("Error fetching SMS messages:", error);
    }
  };

  const toggleRecipient = (workerId: number) => {
    setSelectedRecipients((prevRecipients) =>
      prevRecipients.includes(workerId)
        ? prevRecipients.filter((id) => id !== workerId)
        : [...prevRecipients, workerId]
    );
  };

  // ----- Send Announcement via Socket.IO -----
  const sendMessage = async () => {
    if (!messageText.trim()) {
      Swal.fire({
        icon: "info",
        title: "Empty Message",
        text: "Please type a message before sending.",
      });
      return;
    }
    if (selectedRecipients.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No Recipients",
        text: "Please select at least one worker.",
      });
      return;
    }

    try {
      // Retrieve sender_id from sessionStorage
      const senderId = sessionStorage.getItem("id");

      const messageData = {
        message: messageText,
        sender_id: senderId,
        recipients: selectedRecipients,
      };

      // Post the message to the server
      const response = await axios.post(
        "https://https://health-center-repo-production.up.railway.app/sendMessageToWorkers",
        messageData
      );

      // Create a new message object based on the response
      const newMessage: Message = {
        id: response.data.id, // assuming server returns the message ID
        message: messageText,
        sender: "Admin",
        timestamp: new Date().toISOString(),
      };

      // Update local messages state
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessageText(""); // Clear input

      Swal.fire({
        icon: "success",
        title: "Announcement Sent",
        text: "Your announcement has been sent successfully.",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      Swal.fire({
        icon: "error",
        title: "Send Failed",
        text: "Unable to send your announcement.",
      });
    }
  };

  // ----- Send Announcement via SMS -----
  const sendSmsAnnouncement = async () => {
    if (!messageText.trim()) {
      Swal.fire({
        icon: "info",
        title: "Empty Message",
        text: "Please type a message before sending via SMS.",
      });
      return;
    }

    if (!smsNumber.trim()) {
      Swal.fire({
        icon: "info",
        title: "No Phone Number",
        text: "Please enter a phone number.",
      });
      return;
    }

    const smsData = {
      message: messageText,
      number: smsNumber,
    };

    try {
      const response = await axios.post(
        "https://https://health-center-repo-production.up.railway.app/sendSmsAnnouncement",
        smsData
      );
      console.log("SMS Announcement response:", response.data);

      // Refresh the SMS messages
      fetchSmsMessages();

      setMessageText(""); // Clear input
      setSmsNumber(""); // Clear phone number

      Swal.fire({
        icon: "success",
        title: "SMS Sent",
        text: "SMS announcement sent successfully!",
      });
    } catch (error) {
      console.error("Error sending SMS announcement:", error);
      Swal.fire({
        icon: "error",
        title: "SMS Send Failed",
        text: "An error occurred while sending the SMS announcement.",
      });
    }
  };

  return (
    <div className="w-full min-h-screen">
      <h1 className="text-2xl font-bold pl-3 mb-9">ANNOUNCEMENTS</h1>

      <Tabs>
        {/* ---------------- TAB 1: SOCKET ANNOUNCEMENT ---------------- */}
        <Tab title="Announcement to Workers">
          <div className="flex flex-col md:flex-row gap-7 w-full md:h-[750px] bg-white rounded-xl overflow-hidden shadow-md border border-gray-100">
            {/* Left Side: List of Workers */}
            <div className="w-full md:w-1/3 border-r h-full rounded-xl bg-gray-100 px-4 py-7">
              <h1 className="text-xl font-bold">Select Workers</h1>
              <div className="bg-white shadow-md rounded-xl p-4 mt-3 w-full h-full flex flex-col gap-3">
                {workers.map((worker) => (
                  <div
                    key={worker.id}
                    className="flex items-center gap-2 p-4 bg-slate-100 rounded-xl"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRecipients.includes(worker.id)}
                      onChange={() => toggleRecipient(worker.id)}
                    />
                    <span className="text-base font-semibold">
                      {worker.first_name} {worker.last_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Messages */}
            <div className="w-full md:w-2/3 rounded-xl flex flex-col justify-end h-full py-7 px-4">
              <h1 className="text-2xl font-bold mb-7">Messages</h1>
              <div className="flex flex-col gap-5 h-[600px] overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className="p-5 bg-slate-100 rounded-xl">
                    <p className="text-sm font-medium text-green-500">
                      {msg.message}
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(Date.parse(msg.timestamp)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-5 items-center mt-7">
                <Input
                  size="lg"
                  type="text"
                  label="Message"
                  placeholder="Type anything..."
                  className="flex-1"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <button onClick={sendMessage}>
                  <IoSend size={30} className="text-green-500" />
                </button>
              </div>
            </div>
          </div>
        </Tab>

        {/* ---------------- TAB 2: SMS ANNOUNCEMENT ---------------- */}
        <Tab title="Announcement via SMS">
          <div className="flex flex-col md:flex-row gap-7 w-full md:h-[750px] bg-white rounded-xl overflow-hidden shadow-md border border-gray-100">
            {/* Left Side: Enter Phone Number */}
            <div className="w-full md:w-1/3 border-r h-full rounded-xl bg-gray-100 px-4 py-7">
              <h1 className="text-xl font-bold">Enter Phone Number</h1>
              <div className="bg-white shadow-md rounded-xl p-4 mt-3 w-full h-full flex flex-col gap-3">
                <Input
                  size="lg"
                  type="text"
                  label="Phone Number"
                  placeholder="Enter phone number..."
                  value={smsNumber}
                  onChange={(e) => setSmsNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Right Side: SMS Messages */}
            <div className="w-full md:w-2/3 rounded-xl flex flex-col justify-end h-full py-7 px-4">
              <h1 className="text-2xl font-bold mb-7">SMS Announcement</h1>
              <div className="flex flex-col gap-5 h-[600px] overflow-y-auto">
                {smsMessages.map((msg) => (
                  <div key={msg.id} className="p-5 bg-slate-100 rounded-xl">
                    <p className="text-sm font-medium text-green-500">
                      {msg.message}
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(Date.parse(msg.timestamp)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-5 items-center mt-7">
                <Input
                  size="lg"
                  type="text"
                  label="Message"
                  placeholder="Type anything..."
                  className="flex-1"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <button onClick={sendSmsAnnouncement}>
                  <IoSend size={30} className="text-green-500" />
                </button>
              </div>
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default Announcement;
