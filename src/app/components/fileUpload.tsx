"use client";
import React, { useState } from 'react';
import { 
    Box, 
    Button, 
    Typography, 
    LinearProgress,
    Alert,
    Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
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
    const [error, setError] = useState<string | null>(null);

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setError(null);
        try {
            const result = await FileService.uploadFile(selectedFile);
            onUploadSuccess?.(result);
            setSelectedFile(null);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            setError(errorMessage);
            onUploadError?.(error as Error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* File Selection */}
                <Button
                    component="label"
                    variant="outlined"
                    startIcon={<AttachFileIcon />}
                    disabled={isUploading}
                    sx={{ 
                        py: 1.5,
                        borderStyle: 'dashed',
                        borderWidth: 2,
                        '&:hover': {
                            borderStyle: 'dashed',
                            borderWidth: 2,
                        }
                    }}
                >
                    Choose File to Upload
                    <input
                        type="file"
                        hidden
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        disabled={isUploading}
                    />
                </Button>
                
                {/* Selected File Display */}
                {selectedFile && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Selected:
                        </Typography>
                        <Chip
                            icon={<AttachFileIcon />}
                            label={selectedFile.name}
                            variant="outlined"
                            color="primary"
                        />
                    </Box>
                )}

                {/* Upload Progress */}
                {isUploading && (
                    <Box sx={{ width: '100%' }}>
                        <LinearProgress />
                        <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                            Uploading...
                        </Typography>
                    </Box>
                )}

                {/* Upload Button */}
                <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                    startIcon={<CloudUploadIcon />}
                    sx={{ py: 1.5 }}
                    size="large"
                >
                    {isUploading ? 'Uploading...' : 'Upload to Data Lake'}
                </Button>
            </Box>
        </Box>
    );
};