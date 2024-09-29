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
export const workerColumn = [
  "No",
  "Name",
  "Age",
  "Address",
  "Sex",
  "Birth",
  "Place Assigned",
  "Username",
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
  {
    category: "Antihypertensives",
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
  {
    category: "Antidiabetics",
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
  {
    category: "Analgesics",
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
  {
    category: "Antipyretics",
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
  {
    category: "Antidepressants",
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
  {
    category: "Vaccines",
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
  {
    category: "Vitamins",
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
  {
    category: "Antivirals",
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
  {
    category: "Antifungals",
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
  {
    category: "Antihistamines",
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
  {
    category: "Corticosteroids",
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
  {
    category: "Immunosuppressants",
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

export const clientInputFields = [
  {
    category: "Pregnant",
    inputFields: [
      {
        type: "text",
        name: "name",
      },
      {
        type: "text",
        name: "address",
      },
      {
        type: "number",
        name: "phone",
      },
      {
        type: "date",
        name: "birth",
      },
      {
        type: "text",
        name: "philhealthId",
      },
      {
        type: "date",
        name: "dateRegistered",
      },
    ],
  },
];
