"use client";
import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Button, 
    Typography, 
    LinearProgress,
    Alert,
    Chip,
    Snackbar,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Card,
    CardContent,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddIcon from '@mui/icons-material/Add';
import { FileService, FilePropertiesDto } from '@/service/FileService';
import { CustomerService, Customer } from '@/service/CustomerService';
import { DatasetKeyService, DatasetKey } from '@/service/DatasetKeyService';

interface FileUploadProps {
    onUploadSuccess?: (result: any) => void;
    onUploadError?: (error: Error) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
    onUploadSuccess, 
    onUploadError 
}) => {
    // File upload state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successOpen, setSuccessOpen] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Customer and Dataset state
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [datasetKeys, setDatasetKeys] = useState<DatasetKey[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [selectedDatasetKey, setSelectedDatasetKey] = useState<DatasetKey | null>(null);
    const [versionNumber, setVersionNumber] = useState<number>(1);
    const [dataLakeFileLevel, setDataLakeFileLevel] = useState<'raw' | 'clean' | 'standardized'>('raw');
    const [metadata, setMetadata] = useState<Record<string, any>>({});

    // Dialog states
    const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
    const [datasetDialogOpen, setDatasetDialogOpen] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', email: '', description: '', pathName: '' });
    const [newDatasetKey, setNewDatasetKey] = useState({ name: '', description: '', pathName: '', customerId: 0 });

    // Load customers and dataset keys on component mount
    useEffect(() => {
        loadCustomers();
        loadDatasetKeys();
    }, []);

    const loadCustomers = async () => {
        try {
            const response = await CustomerService.getCustomers();
            setCustomers(response.content);
        } catch (error) {
            console.error('Failed to load customers:', error);
        }
    };

    const loadDatasetKeys = async () => {
        try {
            const response = await DatasetKeyService.getDatasetKeys();
            setDatasetKeys(response.content);
        } catch (error) {
            console.error('Failed to load dataset keys:', error);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !selectedCustomer || !selectedDatasetKey) {
            setError('Please select a file, customer, and dataset key');
            return;
        }

        setIsUploading(true);
        setError(null);
        try {
            const fileProperties = FileService.createFileProperties(
                selectedFile,
                {
                    id: selectedCustomer.id!,
                    name: selectedCustomer.name,
                    description: selectedCustomer.description,
                    pathName: selectedCustomer.pathName
                },
                {
                    id: selectedDatasetKey.id!,
                    name: selectedDatasetKey.name,
                    description: selectedDatasetKey.description,
                    pathName: selectedDatasetKey.pathName
                },
                versionNumber,
                dataLakeFileLevel,
                metadata
            );

            const result = await FileService.uploadFile(selectedFile, fileProperties);
            onUploadSuccess?.(result);
            setSelectedFile(null);
            
            // Show success toast
            setToastMessage(`File "${selectedFile.name}" uploaded successfully!`);
            setSuccessOpen(true);
            
        } catch (error: any) {
            let backendMessage = 'Upload failed';
            
            // Extract error message from backend response
            if (error?.response?.data?.message) {
                backendMessage = error.response.data.message;
            } else if (error?.message) {
                backendMessage = error.message;
            }
            
            const errorMessage = `Error uploading file: ${backendMessage}`;
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

    // Customer dialog handlers
    const handleCreateCustomer = async () => {
        try {
            const customer = await CustomerService.createCustomer(newCustomer);
            setCustomers([...customers, customer]);
            setSelectedCustomer(customer);
            setCustomerDialogOpen(false);
            setNewCustomer({ name: '', email: '', description: '', pathName: '' });
        } catch (error) {
            console.error('Failed to create customer:', error);
        }
    };

    // Dataset dialog handlers
    const handleCreateDatasetKey = async () => {
        try {
            const datasetKeyData = {
                ...newDatasetKey,
                customerId: newDatasetKey.customerId || undefined
            };
            const datasetKey = await DatasetKeyService.createDatasetKey(datasetKeyData);
            setDatasetKeys([...datasetKeys, datasetKey]);
            setSelectedDatasetKey(datasetKey);
            setDatasetDialogOpen(false);
            setNewDatasetKey({ name: '', description: '', pathName: '', customerId: 0 });
        } catch (error) {
            console.error('Failed to create dataset key:', error);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* File Selection Card */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            File Selection
                        </Typography>
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
                
                {selectedFile && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
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
                    </CardContent>
                </Card>

                {/* Customer and Dataset Selection */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Card sx={{ flex: 1, minWidth: 300 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6">
                                    Customer
                                </Typography>
                                <Button
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => setCustomerDialogOpen(true)}
                                >
                                    New
                                </Button>
                            </Box>
                            <FormControl fullWidth>
                                <InputLabel>Select Customer</InputLabel>
                                <Select
                                    value={selectedCustomer?.id || ''}
                                    onChange={(e) => {
                                        const customer = customers.find(c => c.id === e.target.value);
                                        setSelectedCustomer(customer || null);
                                    }}
                                    label="Select Customer"
                                >
                                    {customers.map((customer) => (
                                        <MenuItem key={customer.id} value={customer.id}>
                                            {customer.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </CardContent>
                    </Card>

                    <Card sx={{ flex: 1, minWidth: 300 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6">
                                    Dataset Key
                                </Typography>
                                <Button
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => setDatasetDialogOpen(true)}
                                >
                                    New
                                </Button>
                            </Box>
                            <FormControl fullWidth>
                                <InputLabel>Select Dataset Key</InputLabel>
                                <Select
                                    value={selectedDatasetKey?.id || ''}
                                    onChange={(e) => {
                                        const datasetKey = datasetKeys.find(d => d.id === e.target.value);
                                        setSelectedDatasetKey(datasetKey || null);
                                    }}
                                    label="Select Dataset Key"
                                >
                                    {datasetKeys.map((datasetKey) => (
                                        <MenuItem key={datasetKey.id} value={datasetKey.id}>
                                            {datasetKey.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </CardContent>
                    </Card>
                </Box>

                {/* File Properties */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            File Properties
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <TextField
                                label="Version Number"
                                type="number"
                                value={versionNumber}
                                onChange={(e) => setVersionNumber(parseInt(e.target.value) || 1)}
                                inputProps={{ min: 1 }}
                                sx={{ minWidth: 200 }}
                            />
                            <FormControl sx={{ minWidth: 200 }}>
                                <InputLabel>Data Lake File Level</InputLabel>
                                <Select
                                    value={dataLakeFileLevel}
                                    onChange={(e) => setDataLakeFileLevel(e.target.value as 'raw' | 'clean' | 'standardized')}
                                    label="Data Lake File Level"
                                >
                                    <MenuItem value="raw">Raw</MenuItem>
                                    <MenuItem value="clean">Clean</MenuItem>
                                    <MenuItem value="standardized">Standardized</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </CardContent>
                </Card>

                {/* Upload Section */}
                <Card>
                    <CardContent>
                {isUploading && (
                            <Box sx={{ width: '100%', mb: 2 }}>
                        <LinearProgress />
                        <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                            Uploading...
                        </Typography>
                    </Box>
                )}

                <Button
                    variant="contained"
                    onClick={handleUpload}
                            disabled={!selectedFile || !selectedCustomer || !selectedDatasetKey || isUploading}
                    startIcon={<CloudUploadIcon />}
                    sx={{ py: 1.5 }}
                    size="large"
                            fullWidth
                >
                    {isUploading ? 'Uploading...' : 'Upload to Data Lake'}
                </Button>
                    </CardContent>
                </Card>
            </Box>

            {/* Create Customer Dialog */}
            <Dialog open={customerDialogOpen} onClose={() => setCustomerDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Customer</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Name"
                            value={newCustomer.name}
                            onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={newCustomer.email}
                            onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            value={newCustomer.description}
                            onChange={(e) => setNewCustomer({...newCustomer, description: e.target.value})}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Path Name"
                            value={newCustomer.pathName}
                            onChange={(e) => setNewCustomer({...newCustomer, pathName: e.target.value})}
                            margin="normal"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCustomerDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateCustomer} variant="contained" disabled={!newCustomer.name || !newCustomer.email}>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create Dataset Key Dialog */}
            <Dialog open={datasetDialogOpen} onClose={() => setDatasetDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Dataset Key</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Name"
                            value={newDatasetKey.name}
                            onChange={(e) => setNewDatasetKey({...newDatasetKey, name: e.target.value})}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            value={newDatasetKey.description}
                            onChange={(e) => setNewDatasetKey({...newDatasetKey, description: e.target.value})}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Path Name"
                            value={newDatasetKey.pathName}
                            onChange={(e) => setNewDatasetKey({...newDatasetKey, pathName: e.target.value})}
                            margin="normal"
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Customer (Optional)</InputLabel>
                            <Select
                                value={newDatasetKey.customerId || ''}
                                onChange={(e) => setNewDatasetKey({...newDatasetKey, customerId: e.target.value as number})}
                                label="Customer (Optional)"
                            >
                                <MenuItem value="">
                                    <em>No Customer</em>
                                </MenuItem>
                                {customers.map((customer) => (
                                    <MenuItem key={customer.id} value={customer.id}>
                                        {customer.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDatasetDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateDatasetKey} variant="contained" disabled={!newDatasetKey.name}>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

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