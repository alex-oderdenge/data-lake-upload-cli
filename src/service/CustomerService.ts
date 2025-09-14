// src/service/CustomerService.ts
import axios from "axios";
import config from "@/config";

const BASE_URL = config.backendUrl.replace(/\/$/, ""); // trim trailing slash

export interface Customer {
  id?: number;
  name: string;
  email: string;
  description?: string;
  pathName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerCreateRequest {
  name: string;
  email: string;
  description?: string;
  pathName?: string;
}

export const CustomerService = {
  // Get all customers with pagination
  getCustomers: async (page: number = 0, size: number = 20): Promise<{ content: Customer[], totalElements: number }> => {
    const url = `${BASE_URL}${config.endpoints.CustomerController.list}?page=${page}&size=${size}`;
    const response = await axios.get(url);
    return response.data;
  },

  // Get customer by ID
  getCustomer: async (id: number): Promise<Customer> => {
    const url = `${BASE_URL}${config.endpoints.CustomerController.get(id)}`;
    const response = await axios.get(url);
    return response.data;
  },

  // Create new customer
  createCustomer: async (customer: CustomerCreateRequest): Promise<Customer> => {
    const url = `${BASE_URL}${config.endpoints.CustomerController.create}`;
    const response = await axios.post(url, customer, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  },

  // Update customer
  updateCustomer: async (id: number, customer: Partial<CustomerCreateRequest>): Promise<Customer> => {
    const url = `${BASE_URL}${config.endpoints.CustomerController.update(id)}`;
    const response = await axios.put(url, customer, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  },

  // Delete customer
  deleteCustomer: async (id: number): Promise<void> => {
    const url = `${BASE_URL}${config.endpoints.CustomerController.delete(id)}`;
    await axios.delete(url);
  },

  // Search customers
  searchCustomers: async (query: string): Promise<Customer[]> => {
    const url = `${BASE_URL}${config.endpoints.CustomerController.search}?name=${encodeURIComponent(query)}`;
    const response = await axios.get(url);
    return response.data;
  }
};
