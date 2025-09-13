"use client";
import React, { useState } from 'react';
import { 
    Box, 
    Button, 
    Typography, 
    LinearProgress,
    Alert,
    Chip,
    Snackbar
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
    const [successOpen, setSuccessOpen] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setError(null);
        try {
            const result = await FileService.uploadFile(selectedFile);
            onUploadSuccess?.(result);
            setSelectedFile(null);
            
            // Show success toast
            setToastMessage(`Arquivo "${selectedFile.name}" enviado com sucesso!`);
            setSuccessOpen(true);
            
        } catch (error: any) {
            let backendMessage = 'Falha no upload';
            
            // Extract error message from backend response
            if (error?.response?.data?.message) {
                backendMessage = error.response.data.message;
            } else if (error?.message) {
                backendMessage = error.message;
            }
            
            const errorMessage = `Erro ao fazer upload de arquivo: ${backendMessage}`;
            setError(errorMessage);
            setToastMessage(errorMessage);
            setErrorOpen(true);
            onUploadError?.(error as Error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleCloseSuccess = () => {
        setSuccessOpen(false);
    };

    const handleCloseError = () => {
        setErrorOpen(false);
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

            {/* Success Toast */}
            <Snackbar
                open={successOpen}
                autoHideDuration={4000}
                onClose={handleCloseSuccess}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert 
                    onClose={handleCloseSuccess} 
                    severity="success" 
                    sx={{ width: '100%' }}
                    variant="filled"
                >
                    {toastMessage}
                </Alert>
            </Snackbar>

            {/* Error Toast */}
            <Snackbar
                open={errorOpen}
                autoHideDuration={6000}
                onClose={handleCloseError}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert 
                    onClose={handleCloseError} 
                    severity="error" 
                    sx={{ width: '100%' }}
                    variant="filled"
                >
                    {toastMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};