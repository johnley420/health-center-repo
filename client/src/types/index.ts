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

export type clientTypes = {
  name: string;
  address: string;
  phone: string;
  birth: string;
  philhealthId: string;
  dateRegistered: string;
};

export type categoryFieldTypes = {
  category: string;
  data: any;
  fields: string[];
};
