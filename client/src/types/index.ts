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
};

export type clientTypes = {
  name: string;
  address: string;
  phone: string;
  birth: string;
  philhealthId: string;
  dateRegistered: string;
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