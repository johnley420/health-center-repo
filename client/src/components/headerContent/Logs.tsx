import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardBody,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tab,
  Tabs,
} from "@nextui-org/react";
import { IoCalendarOutline } from "react-icons/io5";
import axios from 'axios';

type LogEntry = {
  date: string;
  status: string;
  time_in: string | null;
  time_out: string | null;
};

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState("Time In");

  const userId = sessionStorage.getItem('id');

  const fetchLogs = async () => {
    try {
      const response = await axios.get('https://https://health-center-repo-production.up.railway.app/get-attendance-logs', {
        params: { userId }
      });
      setLogs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs([]);
    }
  };

  const handleLogAttendance = async () => {
    if (!userId) {
      alert("User ID not found. Please log in.");
      return;
    }

    const currentDate = new Date();
    const date = currentDate.toISOString().split('T')[0];
    const time = currentDate.toTimeString().split(' ')[0];

    try {
      const response = await axios.post('https://https://health-center-repo-production.up.railway.app/log-attendance', {
        userId,
        date,
        [status === "Time In" ? "timeIn" : "timeOut"]: time
      });

      alert(response.data.message);
      setStatus(status === "Time In" ? "Time Out" : "Time In");
      await fetchLogs(); // Refresh logs immediately after logging attendance
    } catch (error) {
      console.error("Error logging attendance:", error);
      alert("Failed to log attendance.");
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [status]); // Fetch logs when status changes

  return (
    <Popover className="w-[350px]" placement="top" showArrow={true}>
      <PopoverTrigger className="cursor-pointer">
        <button className="outline-none">
          <IoCalendarOutline size={23} className="text-green-500" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="py-3">
        <Tabs aria-label="Options">
          <Tab key="logs" title="Daily Log">
            <Card>
              <CardBody className="w-[300px]">
                <p className="text-lg font-medium text-center mb-5">
                  Daily Log
                </p>
                <div className="w-full flex items-center justify-between px-3 mb-5">
                  <p className="font-semibold">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
                  <p className="text-xs text-green-500 py-2 px-3 bg-green-100 rounded-full">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
                <Button
                  color="success"
                  className="text-lg text-white font-medium py-3 px-3 bg-green-500"
                  onClick={handleLogAttendance}
                >
                  {status}
                </Button>
              </CardBody>
            </Card>
          </Tab>
          <Tab key="history" title="History">
            <Card className="w-full">
              <CardBody className="w-[300px]">
                <p className="text-lg font-medium text-center">History</p>
                <div className="px-3 py-4 flex flex-col gap-5 w-full">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className="w-full flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <p>{new Date(log.date).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                      </div>
                      <div className={`text-lg ${log.status === "absent" ? "text-red-500" : "text-green-500"}`}>
                        {log.status || (log.time_in && log.time_out ? "present" : "absent")}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export default Logs;
