export const ADDRESS_TYPES = ["home", "work", "other"] as const;

export type AddressType = (typeof ADDRESS_TYPES)[number];

export type Address = {
  id: string;
  label: string | null;
  type: AddressType;
  fullName: string;
  mobile: string;
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AddressFormState = {
  label: string;
  type: AddressType;
  fullName: string;
  mobile: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
};

export type AddressDraft = {
  fullName: string;
  mobile: string;
  line1: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  type?: AddressType;
  label?: string;
  line2?: string;
  landmark?: string;
};

export type AddressWrite = Omit<AddressDraft, "label" | "line2" | "landmark"> & {
  label?: string | null;
  line2?: string | null;
  landmark?: string | null;
  isDefault?: boolean;
};

export type AddressQuery = {
  page?: number;
  limit?: number;
  search?: string;
  type?: AddressType;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isDefault?: boolean;
  sort?: "newest" | "oldest" | "name";
};
