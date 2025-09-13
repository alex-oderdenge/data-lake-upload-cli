// src/config.js
const config = {
  backendUrl: 'http://localhost:8087',
  
  // endpoints
    endpoints: {
        FileController: {
            upload: '/api/v1/files'+'/upload'
        }
    }
};

export default config;
