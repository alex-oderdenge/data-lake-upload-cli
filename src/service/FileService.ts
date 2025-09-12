import axios from 'axios';
import config from '@/config';
const BASE_URL = config.backendUrl;

export const FileService = {
    uploadFile: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post('/api/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data.fileUrl;
    }
}