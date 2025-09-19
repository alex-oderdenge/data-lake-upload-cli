// src/config.ts
const config = {
  backendUrl: 'http://localhost:8087',
  
  // endpoints
  endpoints: {
    FileController: {
      upload: '/api/v1/files/upload'
    },
    CustomerController: {
      list: '/api/v1/customers',
      create: '/api/v1/customers',
      get: (id: number) => `/api/v1/customers/${id}`,
      update: (id: number) => `/api/v1/customers/${id}`,
      delete: (id: number) => `/api/v1/customers/${id}`,
      search: '/api/v1/customers/search'
    },
    DatasetKeyController: {
      list: '/api/v1/dataset-keys',
      create: '/api/v1/dataset-keys',
      get: (id: number) => `/api/v1/dataset-keys/${id}`,
      update: (id: number) => `/api/v1/dataset-keys/${id}`,
      delete: (id: number) => `/api/v1/dataset-keys/${id}`,
      search: '/api/v1/dataset-keys/search'
    },
    FilePropertiesController: {
      filter: '/api/v1/file-properties/filter'
    }
  }
};

export default config;
