// src/service/FileService.ts
import axios from "axios";
import config from "@/config";

const BASE_URL = config.backendUrl.replace(/\/$/, ""); // trim trailing slash

export const FileService = {
    uploadFile: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", file.name);

        const url = `${BASE_URL}${config.endpoints.FileController.upload}`; // <-- absolute URL
        const response = await axios.post(url, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return response.data.fileUrl;
    },
};
