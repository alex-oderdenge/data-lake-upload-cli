// src/service/FileService.ts
import axios from "axios";
import config from "@/config";

const BASE_URL = config.backendUrl.replace(/\/$/, ""); // trim trailing slash

export interface FilePropertiesDto {
  fileName: string;
  originalFileName: string;
  contentType?: string;
  fileExtension?: string;
  sizeInBytes: number;
  customer: {
    id: number;
    name: string;
    description?: string;
    pathName?: string;
  };
  fileVersion: {
    id?: number;
    versionNumber: number;
    description?: string;
  };
  dataLakeFileLevel: 'raw' | 'clean' | 'standardized';
  metadata?: Record<string, any>;
  uploadedAt?: string;
  fileCreatedAt?: string;
  datasetKey?: {
    id: number;
    name: string;
    description?: string;
    pathName?: string;
  };
  uploadedMonth?: string;
}

export interface FileUploadRequest {
  file: File;
  fileProperties: FilePropertiesDto;
}

export interface FileFilterParams {
  customerId?: number;
  dataLakeFileLevel?: string;
  fileName?: string;
  originalFileName?: string;
  contentType?: string;
  fileExtension?: string;
  datasetKeyId?: number;
  fileVersionId?: number;
  folderPath?: string;
  fullPath?: string;
  uploadedAtStart?: string;
  uploadedAtEnd?: string;
  fileCreatedAtStart?: string;
  fileCreatedAtEnd?: string;
  createdAtStart?: string;
  createdAtEnd?: string;
  minSizeInBytes?: number;
  maxSizeInBytes?: number;
  customerDescription?: string;
  customerPathName?: string;
  fileVersionNumber?: number;
  datasetDescription?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface FileListResponse {
  content: FilePropertiesDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export const FileService = {
  uploadFile: async (file: File, fileProperties: FilePropertiesDto): Promise<string> => {
    const formData = new FormData();
    
    // Add the file
    formData.append("file", file);
    
    // Add basic file properties
    formData.append("fileName", fileProperties.fileName);
    formData.append("originalFileName", fileProperties.originalFileName);
    formData.append("contentType", fileProperties.contentType || file.type);
    formData.append("fileExtension", fileProperties.fileExtension || `.${file.name.split('.').pop()}`);
    formData.append("sizeInBytes", fileProperties.sizeInBytes.toString());
    formData.append("dataLakeFileLevel", fileProperties.dataLakeFileLevel.toUpperCase());
    
    // Add customer information
    if (fileProperties.customer) {
      formData.append("customer.id", fileProperties.customer.id.toString());
      formData.append("customer.name", fileProperties.customer.name);
      if (fileProperties.customer.description) {
        formData.append("customer.description", fileProperties.customer.description);
      }
      if (fileProperties.customer.pathName) {
        formData.append("customer.pathName", fileProperties.customer.pathName);
      }
    }
    
    // Add file version information
    if (fileProperties.fileVersion) {
      // Don't send fileVersion.id if it's null/undefined (let backend auto-generate)
      if (fileProperties.fileVersion.id !== null && fileProperties.fileVersion.id !== undefined) {
        formData.append("fileVersion.id", fileProperties.fileVersion.id.toString());
      }
      formData.append("fileVersion.versionNumber", fileProperties.fileVersion.versionNumber.toString());
      if (fileProperties.fileVersion.description) {
        formData.append("fileVersion.description", fileProperties.fileVersion.description);
      }
    }
    
    // Add dataset key information
    if (fileProperties.datasetKey) {
      formData.append("datasetKey.id", fileProperties.datasetKey.id.toString());
      formData.append("datasetKey.name", fileProperties.datasetKey.name);
      if (fileProperties.datasetKey.description) {
        formData.append("datasetKey.description", fileProperties.datasetKey.description);
      }
      if (fileProperties.datasetKey.pathName) {
        formData.append("datasetKey.pathName", fileProperties.datasetKey.pathName);
      }
    }
    
    // Add metadata (optional)
    if (fileProperties.metadata) {
      Object.entries(fileProperties.metadata).forEach(([key, value]) => {
        formData.append(`metadata.${key}`, value.toString());
      });
    }
    
    // Add optional timestamp fields (convert ISO string to LocalDateTime format)
    if (fileProperties.uploadedAt) {
      // Convert ISO string to LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
      const uploadedDate = new Date(fileProperties.uploadedAt);
      const localDateTime = uploadedDate.toISOString().slice(0, 19);
      formData.append("uploadedAt", localDateTime);
    }
    if (fileProperties.fileCreatedAt) {
      // Convert ISO string to LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
      const createdDate = new Date(fileProperties.fileCreatedAt);
      const localDateTime = createdDate.toISOString().slice(0, 19);
      formData.append("fileCreatedAt", localDateTime);
    }
    if (fileProperties.uploadedMonth) {
      formData.append("uploadedMonth", fileProperties.uploadedMonth);
    }

    const url = `${BASE_URL}${config.endpoints.FileController.upload}`;
    const response = await axios.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  },

  filterFiles: async (filters: FileFilterParams): Promise<FileListResponse> => {
    const params = new URLSearchParams();
    
    // Add all filter parameters to the query string
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const url = `${BASE_URL}${config.endpoints.FilePropertiesController.filter}?${params.toString()}`;
    const response = await axios.get(url);
    return response.data;
  },

  // Helper method to create file properties from file and metadata
  createFileProperties: (
    file: File,
    customer: { id: number; name: string; description?: string; pathName?: string },
    datasetKey: { id: number; name: string; description?: string; pathName?: string },
    versionNumber: number = 1,
    dataLakeFileLevel: 'raw' | 'clean' | 'standardized' = 'raw',
    metadata?: Record<string, any>,
    versionDescription?: string
  ): FilePropertiesDto => {
    const now = new Date().toISOString();
    const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
    
    return {
      fileName: file.name,
      originalFileName: file.name,
      contentType: file.type || 'application/octet-stream',
      fileExtension: fileExtension,
      sizeInBytes: file.size,
      customer: customer,
      fileVersion: {
        versionNumber: versionNumber,
        description: versionDescription || `Version ${versionNumber} of ${file.name}`
      },
      dataLakeFileLevel: dataLakeFileLevel,
      metadata: metadata || {},
      uploadedAt: now,
      fileCreatedAt: now,
      datasetKey: datasetKey,
      uploadedMonth: new Date().toLocaleString('en-US', { month: 'long' }).toUpperCase()
    };
  }
};
