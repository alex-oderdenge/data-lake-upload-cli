"use client";
import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Card, 
    CardContent, 
    TextField, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    Button, 
    Alert,
    CircularProgress,
    Snackbar
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { FileService } from '@/service/FileService';
import { CustomerService, Customer } from '@/service/CustomerService';
import { DatasetKeyService, DatasetKey } from '@/service/DatasetKeyService';

export const FileDownload: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [datasetKeys, setDatasetKeys] = useState<DatasetKey[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Form state
    const [formData, setFormData] = useState({
        dataLakeFileLevel: 'raw',
        customerId: '',
        datasetKeyId: '',
        versionNumber: 1,
        fileName: '',
        month: new Date().getMonth() + 1, // Current month (1-12)
        year: new Date().getFullYear() // Current year
    });

    const dataLakeLevels = [
        { value: 'raw', label: 'RAW - Dados brutos' },
        { value: 'clean', label: 'CLEAN - Dados convertidos/unificados' },
        { value: 'standardized', label: 'STANDARDIZED - Dados harmonizados' }
    ];

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoadingData(true);
            const [customersResponse, datasetKeysResponse] = await Promise.all([
                CustomerService.getCustomers(0, 1000), // Get up to 1000 customers
                DatasetKeyService.getDatasetKeys(0, 1000) // Get up to 1000 dataset keys
            ]);
            setCustomers(customersResponse.content);
            setDatasetKeys(datasetKeysResponse.content);
        } catch (err) {
            console.error('Error loading initial data:', err);
            setError('Erro ao carregar dados iniciais');
        } finally {
            setLoadingData(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDownload = async () => {
        if (!formData.customerId || !formData.datasetKeyId || !formData.fileName) {
            setError('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            await FileService.downloadFileByFilters(
                formData.dataLakeFileLevel,
                parseInt(formData.customerId),
                parseInt(formData.datasetKeyId),
                formData.versionNumber,
                formData.fileName,
                formData.month,
                formData.year
            );
            
            setSuccess('Arquivo baixado com sucesso!');
        } catch (err: any) {
            console.error('Download error:', err);
            
            // Extract the actual error message from the response
            let errorMessage = 'Erro ao baixar arquivo';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            // Check if it's a "No file found" error
            if (errorMessage.includes('No file found with filters')) {
                const monthNames = [
                    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                ];
                
                setError(`Arquivo não encontrado com os filtros especificados:
                
• Nível: ${formData.dataLakeFileLevel.toUpperCase()}
• Cliente: ${formData.customerId}
• Dataset: ${formData.datasetKeyId}
• Versão: ${formData.versionNumber}
• Arquivo: ${formData.fileName}
• Mês: ${monthNames[formData.month - 1]} de ${formData.year}

Verifique se o arquivo existe com esses parâmetros ou tente outros valores.`);
            } else {
                setError("Erro ao baixar arquivo: " + errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setError(null);
        setSuccess(null);
    };

    if (loadingData) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                Download de Arquivo por Filtros
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Baixe o arquivo mais recente com base nos filtros especificados, incluindo o mês de upload
            </Typography>

            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                            <Box sx={{ flex: 1 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Nível do Data Lake</InputLabel>
                                    <Select
                                        value={formData.dataLakeFileLevel}
                                        onChange={(e) => handleInputChange('dataLakeFileLevel', e.target.value)}
                                        label="Nível do Data Lake"
                                    >
                                        {dataLakeLevels.map((level) => (
                                            <MenuItem key={level.value} value={level.value}>
                                                {level.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>

                            <Box sx={{ flex: 1 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Cliente</InputLabel>
                                    <Select
                                        value={formData.customerId}
                                        onChange={(e) => handleInputChange('customerId', e.target.value)}
                                        label="Cliente"
                                        required
                                    >
                                        {customers.map((customer) => (
                                            <MenuItem key={customer.id || 0} value={customer.id?.toString() || ''}>
                                                {customer.name} ({customer.pathName || 'N/A'})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                            <Box sx={{ flex: 1 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Dataset Key</InputLabel>
                                    <Select
                                        value={formData.datasetKeyId}
                                        onChange={(e) => handleInputChange('datasetKeyId', e.target.value)}
                                        label="Dataset Key"
                                        required
                                    >
                                        {datasetKeys.map((dataset) => (
                                            <MenuItem key={dataset.id || 0} value={dataset.id?.toString() || ''}>
                                                {dataset.name} ({dataset.pathName || 'N/A'})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>

                            <Box sx={{ flex: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Número da Versão"
                                    type="number"
                                    value={formData.versionNumber}
                                    onChange={(e) => handleInputChange('versionNumber', parseInt(e.target.value) || 1)}
                                    inputProps={{ min: 1 }}
                                />
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                            <Box sx={{ flex: 1 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Mês</InputLabel>
                                    <Select
                                        value={formData.month}
                                        onChange={(e) => handleInputChange('month', Number(e.target.value))}
                                        label="Mês"
                                        required
                                    >
                                        {[
                                            { value: 1, label: 'Janeiro' },
                                            { value: 2, label: 'Fevereiro' },
                                            { value: 3, label: 'Março' },
                                            { value: 4, label: 'Abril' },
                                            { value: 5, label: 'Maio' },
                                            { value: 6, label: 'Junho' },
                                            { value: 7, label: 'Julho' },
                                            { value: 8, label: 'Agosto' },
                                            { value: 9, label: 'Setembro' },
                                            { value: 10, label: 'Outubro' },
                                            { value: 11, label: 'Novembro' },
                                            { value: 12, label: 'Dezembro' }
                                        ].map((month) => (
                                            <MenuItem key={month.value} value={month.value}>
                                                {month.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>

                            <Box sx={{ flex: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Ano"
                                    type="number"
                                    value={formData.year}
                                    onChange={(e) => handleInputChange('year', parseInt(e.target.value) || new Date().getFullYear())}
                                    inputProps={{ min: 2020, max: 2030 }}
                                />
                            </Box>
                        </Box>

                        <Box>
                            <TextField
                                fullWidth
                                label="Nome do Arquivo"
                                value={formData.fileName}
                                onChange={(e) => handleInputChange('fileName', e.target.value)}
                                placeholder="Ex: arquivo.csv, relatorio.xlsx"
                                required
                            />
                        </Box>

                        <Box>
                            <Button
                                variant="contained"
                                startIcon={<DownloadIcon />}
                                onClick={handleDownload}
                                disabled={loading || !formData.customerId || !formData.datasetKeyId || !formData.fileName}
                                size="large"
                                fullWidth
                            >
                                {loading ? 'Baixando...' : 'Baixar Arquivo'}
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

            <Snackbar
                open={!!success}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message={success}
            />
        </Box>
    );
};
