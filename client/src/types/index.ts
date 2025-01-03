/* eslint-disable @typescript-eslint/no-explicit-any */
export type roleType = {
  role: "admin" | "worker";
};


export type routesType = {
  path: string;
  element: any;
};

export type sidebarTypes = {
  path: string;
  label: string;
  Icon: React.ElementType;
  children?: sidebarTypes[];
};

// dashboard counst types

export type countTypes = {
  label: string;
  value: number;
  description: string;
  active: boolean;
  withVariant?: {
    male?: number;
    female?: number;
  };
};

// Define the type for client data in types/index.tsx
export interface ClientType {
  id: number;
  worker_id: number;
  fname: string;
  category_name: string;
  address: string;
  phone_no: string;
  phil_id: string;
  latitude: number;
  longitude: number;
  date_registered: string;
  status: string;
}


export type categoryFieldTypes = {
  category: string;
  data: any;
};


export interface workerTypes {
  firstName: string;
  lastName: string;
  sex: string; // or use 'Other' if you want to allow more options
  age: number;
  address: string;
  birthdate: string; // YYYY-MM-DD format
  placeAssigned: string;
  username: string;
}

export interface Medicine {
  id: number;
  name: string;
  category: string;
  quantity: string;
  expirationDate: string;
  image: any;
}


export type clientTypes = {
  name: string;
  address: string;
  phone: string;
  birth: string;
  philhealthId: string;
  dateRegistered: string;
  medicationForm?: any;
  categoryType: string;
};
