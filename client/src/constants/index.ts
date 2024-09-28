import { clientData } from "../services/Data";

export const week = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const clientColumn = [
  "No",
  "Name",
  "Address",
  "Phone No.",
  "Birth",
  "Philealth Id",
  "Date Registered",
  "Action",
];

export const CategoryFilter = ["Pregnant", "Analgesics", "Vaccine"];

export const categoryForm = [
  {
    category: "Pregnant",
    data: clientData,
    fields: [
      "No",
      "Name",
      "Address",
      "Phone No.",
      "Birth",
      "Philealth Id",
      "Date Registered",
      "Action",
    ],
  },
];
