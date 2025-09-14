// src/service/DatasetKeyService.ts
import axios from "axios";
import config from "@/config";

const BASE_URL = config.backendUrl.replace(/\/$/, ""); // trim trailing slash

export interface DatasetKey {
  id?: number;
  name: string;
  description?: string;
  pathName?: string;
  customerId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DatasetKeyCreateRequest {
  name: string;
  description?: string;
  pathName?: string;
  customerId?: number;
}

export const DatasetKeyService = {
  // Get all dataset keys with pagination
  getDatasetKeys: async (page: number = 0, size: number = 20): Promise<{ content: DatasetKey[], totalElements: number }> => {
    const url = `${BASE_URL}${config.endpoints.DatasetKeyController.list}?page=${page}&size=${size}`;
    const response = await axios.get(url);
    return response.data;
  },

  // Get dataset key by ID
  getDatasetKey: async (id: number): Promise<DatasetKey> => {
    const url = `${BASE_URL}${config.endpoints.DatasetKeyController.get(id)}`;
    const response = await axios.get(url);
    return response.data;
  },

  // Create new dataset key
  createDatasetKey: async (datasetKey: DatasetKeyCreateRequest): Promise<DatasetKey> => {
    const url = `${BASE_URL}${config.endpoints.DatasetKeyController.create}`;
    const response = await axios.post(url, datasetKey, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  },

  // Update dataset key
  updateDatasetKey: async (id: number, datasetKey: Partial<DatasetKeyCreateRequest>): Promise<DatasetKey> => {
    const url = `${BASE_URL}${config.endpoints.DatasetKeyController.update(id)}`;
    const response = await axios.put(url, datasetKey, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  },

  // Delete dataset key
  deleteDatasetKey: async (id: number): Promise<void> => {
    const url = `${BASE_URL}${config.endpoints.DatasetKeyController.delete(id)}`;
    await axios.delete(url);
  },

  // Search dataset keys
  searchDatasetKeys: async (query: string): Promise<DatasetKey[]> => {
    const url = `${BASE_URL}${config.endpoints.DatasetKeyController.search}?name=${encodeURIComponent(query)}`;
    const response = await axios.get(url);
    return response.data;
  }
};
