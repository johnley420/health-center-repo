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


export const dummyMedicines = [
  {
    id: 1,
    name: "Paracetamol",
    category: "Pain Reliever",
    quantity: '50',
    expirationDate: "2025-08-12",
    image: "https://th.bing.com/th/id/OIP.Ro2MSWVL2Ykmyvvi2BcWgQHaHa?rs=1&pid=ImgDetMain",
  },
  {
    id: 2,
    name: "Amoxicillin",
    category: "Antibiotic",
    quantity: '30',
    expirationDate: "2024-11-30",
    image: "https://5.imimg.com/data5/SELLER/Default/2020/12/HD/IF/ML/95289/amoxicillin-tablets-1000mg.jpeg",
  },
  {
    id: 3,
    name: "Cetirizine",
    category: "Antihistamine",
    quantity: '100',
    expirationDate: "2026-02-18",
    image: "https://store.iloilosupermart.com/wp-content/uploads/2020/08/CETIRIZINE-TABLET.jpg",
  },
  {
    id: 4,
    name: "Ibuprofen",
    category: "Anti-inflammatory",
    quantity: '60',
    expirationDate: "2023-12-01",
    image: "https://images.heb.com/is/image/HEBGrocery/001011791",
  },
  {
    id: 5,
    name: "Metformin",
    category: "Antidiabetic",
    quantity: '25',
    expirationDate: "2025-05-20",
    image: "https://th.bing.com/th/id/OIP.vy-pzAbteoO-_Yk8eTYjVgHaHa?rs=1&pid=ImgDetMain",
  },
  {
    id: 6,
    name: "Loratadine",
    category: "Antihistamine",
    quantity: '80',
    expirationDate: "2026-07-09",
    image: "https://images.yaoota.com/hi6_rDY7bwVRLDVoJ3CRJAb-sw4=/trim/yaootaweb-production/media/crawledproductimages/3f28c0e9d20b3228fe79255f3f2229980f8ea49c.jpg",
  },
  {
    id: 7,
    name: "Losartan",
    category: "Antihypertensive",
    quantity: '45',
    expirationDate: "2024-09-15",
    image: "https://sa.rosheta.com/upload/8821d8ec905721953ab36aa07f32bbe117cd376e9a9b7b24789969eaa0af31dd.jpg",
  },
  {
    id: 8,
    name: "Aspirin",
    category: "Blood Thinner",
    quantity: '75',
    expirationDate: "2026-01-22",
    image: "https://images.zentail.com/531/60575d4cd53b26f873420d2be3a4a59bff4bceb88413ad907b00d2403726dd50.jpg",
  },
  {
    id: 9,
    name: "Atorvastatin",
    category: "Cholesterol Reducer",
    quantity: '40',
    expirationDate: "2025-03-17",
    image: "https://www.pilldoctor.com.gh/wp-content/uploads/2020/09/atorvastatin-2-1024x1024.jpg",
  },
  {
    id: 10,
    name: "Ciprofloxacin",
    category: "Antibiotic",
    quantity: '20',
    expirationDate: "2024-08-30",
    image: "https://th.bing.com/th/id/OIP.aibaS6YNsfE5ZEWPbJNrSQHaHa?w=600&h=600&rs=1&pid=ImgDetMain",
  },
];

