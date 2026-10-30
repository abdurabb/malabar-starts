import { api } from "@/lib/api";
import { ADDRESS_TYPES } from "@/types/address";
import type {
  Address,
  AddressDraft,
  AddressFormState,
  AddressQuery,
  AddressType,
  AddressWrite,
} from "@/types/address";
import type { Pagination } from "@/types/product";

type AddressListResponse = {
  success: true;
  addresses: Address[];
  pagination: Pagination;
};

type UserAddressListResponse = AddressListResponse & {
  user: { id: string; name: string; email: string };
};

type AddressResponse = {
  success: true;
  message?: string;
  address: Address;
};

type MessageResponse = {
  success: true;
  message: string;
};

export const emptyAddressForm: AddressFormState = {
  label: "",
  type: "home",
  fullName: "",
  mobile: "",
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "",
  country: "United Arab Emirates",
  postalCode: "",
  isDefault: false,
};

export function normalizeMobile(value: string) {
  return value.trim().replace(/[\s()-]/g, "");
}

function placeError(value: string, name: string) {
  const text = value.trim();
  if (text.length < 2 || text.length > 80 || !/[A-Za-z]/.test(text)) {
    return `${name} must be 2–80 characters and include a letter.`;
  }
  return "";
}

export function addressError(form: AddressFormState) {
  const fullName = form.fullName.trim();
  if (fullName.length < 2 || fullName.length > 100) return "Full name must be 2–100 characters.";
  const mobile = normalizeMobile(form.mobile);
  if (!/^\+?\d{7,15}$/.test(mobile)) return "Enter a mobile number with 7–15 digits. A leading + is allowed.";
  const line1 = form.line1.trim();
  if (line1.length < 3 || line1.length > 200) return "Address line 1 must be 3–200 characters.";
  const line2 = form.line2.trim();
  if (line2 && (line2.length < 2 || line2.length > 200)) return "Address line 2 must be 2–200 characters.";
  const landmark = form.landmark.trim();
  if (landmark && (landmark.length < 2 || landmark.length > 120)) return "Landmark must be 2–120 characters.";
  const label = form.label.trim();
  if (label && (label.length < 2 || label.length > 40 || !/[A-Za-z0-9]/.test(label))) {
    return "Label must be 2–40 characters and include a letter or number.";
  }
  const city = placeError(form.city, "City");
  if (city) return city;
  const state = placeError(form.state, "State");
  if (state) return state;
  const country = placeError(form.country, "Country");
  if (country) return country;
  const postal = form.postalCode.trim();
  if (postal.length < 3 || postal.length > 12 || !/^[A-Za-z0-9 -]+$/.test(postal)) {
    return "Postal code must be 3–12 letters, numbers, spaces, or hyphens.";
  }
  if (!(ADDRESS_TYPES as readonly string[]).includes(form.type)) return "Choose home, work, or other.";
  return "";
}

export function toAddressDraft(form: AddressFormState): AddressDraft {
  const draft: AddressDraft = {
    fullName: form.fullName.trim(),
    mobile: normalizeMobile(form.mobile),
    line1: form.line1.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    country: form.country.trim(),
    postalCode: form.postalCode.trim(),
    type: form.type,
  };
  const label = form.label.trim();
  if (label) draft.label = label;
  const line2 = form.line2.trim();
  if (line2) draft.line2 = line2;
  const landmark = form.landmark.trim();
  if (landmark) draft.landmark = landmark;
  return draft;
}

export function toAddressCreate(form: AddressFormState): AddressWrite {
  return {
    ...toAddressDraft(form),
    ...(form.isDefault ? { isDefault: true } : {}),
  };
}

export function toAddressUpdate(form: AddressFormState): AddressWrite {
  return {
    ...toAddressDraft(form),
    label: form.label.trim() || null,
    line2: form.line2.trim() || null,
    landmark: form.landmark.trim() || null,
    ...(form.isDefault ? { isDefault: true } : {}),
  };
}

export function addressToForm(address: {
  label?: string | null;
  type: AddressType;
  fullName: string;
  mobile: string;
  line1: string;
  line2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault?: boolean;
}): AddressFormState {
  return {
    label: address.label ?? "",
    type: address.type,
    fullName: address.fullName,
    mobile: address.mobile,
    line1: address.line1,
    line2: address.line2 ?? "",
    landmark: address.landmark ?? "",
    city: address.city,
    state: address.state,
    country: address.country,
    postalCode: address.postalCode,
    isDefault: Boolean(address.isDefault),
  };
}

export function formatAddressLines(address: {
  line1?: string | null;
  line2?: string | null;
  landmark?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}) {
  const cityLine = [address.city, address.state].filter(Boolean).join(", ");
  const postalLine = [address.postalCode, address.country].filter(Boolean).join(" ");
  return [address.line1, address.line2, address.landmark, cityLine, postalLine].filter(
    (line): line is string => Boolean(line && line.trim()),
  );
}

function queryString(query: AddressQuery) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const search = query.search?.trim().slice(0, 100);
  if (search) params.set("search", search);
  if (query.type) params.set("type", query.type);
  if (query.city?.trim()) params.set("city", query.city.trim());
  if (query.state?.trim()) params.set("state", query.state.trim());
  if (query.country?.trim()) params.set("country", query.country.trim());
  if (query.postalCode?.trim()) params.set("postalCode", query.postalCode.trim());
  if (typeof query.isDefault === "boolean") params.set("isDefault", String(query.isDefault));
  if (query.sort) params.set("sort", query.sort);
  const text = params.toString();
  return text ? `?${text}` : "";
}

export async function listAddresses(query: AddressQuery = {}) {
  return api<AddressListResponse>(`/api/v1/addresses${queryString(query)}`);
}

export async function listUserAddresses(userId: string, query: AddressQuery = {}) {
  return api<UserAddressListResponse>(`/api/v1/addresses/user/${userId}${queryString(query)}`);
}

export async function getAddress(id: string) {
  const result = await api<AddressResponse>(`/api/v1/addresses/${id}`);
  return result.address;
}

export async function createAddress(input: AddressWrite) {
  return api<AddressResponse>("/api/v1/addresses", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateAddress(id: string, input: Partial<AddressWrite>) {
  return api<AddressResponse>(`/api/v1/addresses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteAddress(id: string) {
  return api<MessageResponse>(`/api/v1/addresses/${id}`, { method: "DELETE" });
}
