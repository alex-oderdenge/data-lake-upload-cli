"use client";
import React, { useState } from 'react';
import { FileService } from '@/service/FileService';

interface FileUploadProps {
    onUploadSuccess?: (result: any) => void;
    onUploadError?: (error: Error) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
    onUploadSuccess, 
    onUploadError 
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        try {
            const result = await FileService.uploadFile(selectedFile);
            onUploadSuccess?.(result);
            setSelectedFile(null);
        } catch (error) {
            onUploadError?.(error as Error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="file-upload">
            <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                disabled={isUploading}
            />
            <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
            >
                {isUploading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    );
};