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
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Chip, 
    Pagination, 
    Grid, 
    Alert,
    CircularProgress,
    IconButton,
    Tooltip,
    Snackbar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import { FileService, FileFilterParams, FileListResponse, FilePropertiesDto } from '@/service/FileService';
import { CustomerService, Customer } from '@/service/CustomerService';
import { DatasetKeyService, DatasetKey } from '@/service/DatasetKeyService';

export const FileList: React.FC = () => {
    const [files, setFiles] = useState<FilePropertiesDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0
    });

    // Filter states
    const [filters, setFilters] = useState<FileFilterParams>({
        page: 0,
        size: 10,
        sortBy: 'id',
        sortDir: 'desc'
    });

    // Reference data
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [datasetKeys, setDatasetKeys] = useState<DatasetKey[]>([]);

    // Toast and loading states
    const [toastMessage, setToastMessage] = useState('');
    const [toastOpen, setToastOpen] = useState(false);
    const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('error');
    const [downloadingFileId, setDownloadingFileId] = useState<number | null>(null);

    // Load reference data on component mount
    useEffect(() => {
        loadReferenceData();
        loadFiles();
    }, []);

    // Load files when filters change (including page changes)
    useEffect(() => {
        loadFiles();
    }, [filters]);

    const loadReferenceData = async () => {
        try {
            const [customersResponse, datasetKeysResponse] = await Promise.all([
                CustomerService.getCustomers(),
                DatasetKeyService.getDatasetKeys()
            ]);
            setCustomers(customersResponse.content);
            setDatasetKeys(datasetKeysResponse.content);
        } catch (error) {
            console.error('Failed to load reference data:', error);
        }
    };

    const loadFiles = async () => {
        setLoading(true);
        setError(null);
        try {
            const response: FileListResponse = await FileService.filterFiles(filters);
            setFiles(response.content);
            setPagination({
                page: response.number,
                size: response.size,
                totalElements: response.totalElements,
                totalPages: response.totalPages
            });
        } catch (error: any) {
            console.error('Load files error:', error);
            
            // Extract the actual error message from the response
            let errorMessage = 'Falha ao carregar arquivos';
            
            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }
            
            // Check if it's a "No file found" error and provide a user-friendly message
            if (errorMessage.includes('No file found') || errorMessage.includes('not found')) {
                setError(`Nenhum arquivo encontrado com os filtros aplicados.

Tente ajustar os filtros ou verificar se existem arquivos que correspondem aos critérios selecionados.`);
            } else {
                setError(`Erro ao carregar arquivos: ${errorMessage}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: keyof FileFilterParams, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 0 // Reset to first page when filters change
        }));
    };

    const handleSearch = () => {
        loadFiles();
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const handleRefresh = () => {
        loadFiles();
    };

    const handleDownload = async (fileId: number, fileName: string) => {
        setDownloadingFileId(fileId);
        try {
            await FileService.downloadFile(fileId, fileName);
            setToastMessage(`Arquivo "${fileName}" baixado com sucesso!`);
            setToastSeverity('success');
            setToastOpen(true);
        } catch (error: any) {
            console.error('Download error:', error);
            
            // Extract the actual error message from the response
            let errorMessage = 'Falha ao baixar arquivo';
            
            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }
            
            // Check if it's a "No file found" error and provide a user-friendly message
            if (errorMessage.includes('No file found') || errorMessage.includes('not found')) {
                setToastMessage(`Arquivo não encontrado. Verifique se o arquivo ainda existe no sistema.`);
            } else {
                setToastMessage(`Erro ao baixar arquivo: ${errorMessage}`);
            }
            setToastSeverity('error');
            setToastOpen(true);
        } finally {
            setDownloadingFileId(null);
        }
    };

    const handleCloseToast = () => {
        setToastOpen(false);
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
        setFilters(prev => ({ ...prev, page: page - 1 }));
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h5" component="h2" gutterBottom>
                Lista de Arquivos
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Filtros
                    </Typography>
                    <Grid container spacing={3}>
                        {/* First Row */}
                        <Grid item xs={12} sm={6} md={4} sx={{ minWidth: 240 }}> 
                            <TextField
                                fullWidth
                                label="Nome do Arquivo"
                                value={filters.fileName || ''}
                                onChange={(e) => handleFilterChange('fileName', e.target.value)}
                                onKeyDown={handleKeyDown}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} sx={{ minWidth: 240 }}> 
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Cliente</InputLabel>
                                <Select
                                    value={filters.customerId || ''}
                                    onChange={(e) => handleFilterChange('customerId', e.target.value)}
                                    label="Cliente"
                                >
                                    <MenuItem value="">Todos os Clientes</MenuItem>
                                    {customers.map((customer) => (
                                        <MenuItem key={customer.id} value={customer.id}>
                                            {customer.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} sx={{ minWidth: 240 }}> 
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Nível do Data Lake</InputLabel>
                                <Select
                                    value={filters.dataLakeFileLevel || ''}
                                    onChange={(e) => handleFilterChange('dataLakeFileLevel', e.target.value)}
                                    label="Nível do Data Lake"
                                >
                                    <MenuItem value="">Todos os Níveis</MenuItem>
                                    <MenuItem value="RAW">RAW</MenuItem>
                                    <MenuItem value="CLEAN">CLEAN</MenuItem>
                                    <MenuItem value="STANDARDIZED">STANDARDIZED</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Second Row */}
                        <Grid item xs={12} sm={6} md={4} sx={{ minWidth: 240 }}> 
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Chave de Dataset</InputLabel>
                                <Select
                                    value={filters.datasetKeyId || ''}
                                    onChange={(e) => handleFilterChange('datasetKeyId', e.target.value)}
                                    label="Chave de Dataset"
                                >
                                    <MenuItem value="">Todas as Chaves</MenuItem>
                                    {datasetKeys.map((datasetKey) => (
                                        <MenuItem key={datasetKey.id} value={datasetKey.id}>
                                            {datasetKey.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} sx={{ minWidth: 240 }}> 
                            <TextField
                                fullWidth
                                label="Tipo de Conteúdo"
                                value={filters.contentType || ''}
                                onChange={(e) => handleFilterChange('contentType', e.target.value)}
                                onKeyDown={handleKeyDown}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} sx={{ minWidth: 240 }}> 
                            <TextField
                                fullWidth
                                label="Extensão do Arquivo"
                                value={filters.fileExtension || ''}
                                onChange={(e) => handleFilterChange('fileExtension', e.target.value)}
                                onKeyDown={handleKeyDown}
                                variant="outlined"
                            />
                        </Grid>

                        {/* Third Row */}
                        <Grid item xs={12} sm={6} md={6} sx={{ minWidth: 240 }}> 
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Ordenar por</InputLabel>
                                <Select
                                    value={filters.sortBy || 'id'}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                    label="Ordenar por"
                                >
                                    <MenuItem value="id">ID</MenuItem>
                                    <MenuItem value="fileName">Nome do Arquivo</MenuItem>
                                    <MenuItem value="uploadedAt">Data de Upload</MenuItem>
                                    <MenuItem value="sizeInBytes">Tamanho</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={6} sx={{ minWidth: 240 }}> 
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Direção da Ordenação</InputLabel>
                                <Select
                                    value={filters.sortDir || 'desc'}
                                    onChange={(e) => handleFilterChange('sortDir', e.target.value)}
                                    label="Direção da Ordenação"
                                >
                                    <MenuItem value="asc">Crescente</MenuItem>
                                    <MenuItem value="desc">Decrescente</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<SearchIcon />}
                            onClick={handleSearch}
                            disabled={loading}
                        >
                            Buscar
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={handleRefresh}
                            disabled={loading}
                        >
                            Atualizar
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Results */}
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                            Resultados ({pagination.totalElements} arquivos)
                        </Typography>
                        {loading && <CircularProgress size={24} />}
                    </Box>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Nome do Arquivo</TableCell>
                                    <TableCell>Cliente</TableCell>
                                    <TableCell>Chave de Dataset</TableCell>
                                    <TableCell>Nível</TableCell>
                                    <TableCell>Tamanho</TableCell>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell>Data Upload</TableCell>
                                    <TableCell>Versão</TableCell>
                                    <TableCell>Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {files.map((file) => (
                                    <TableRow key={file.id || file.fileName}>
                                        <TableCell>{file.id}</TableCell>
                                        <TableCell>
                                            <Tooltip title={file.originalFileName}>
                                                <Typography variant="body2" noWrap>
                                                    {file.fileName}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>{file.customer?.name || '-'}</TableCell>
                                        <TableCell>
                                            <Tooltip title={file.datasetKey?.description || file.datasetKey?.name}>
                                                <Typography variant="body2" noWrap>
                                                    {file.datasetKey?.name || '-'}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={file.dataLakeFileLevel} 
                                                color={
                                                    file.dataLakeFileLevel === 'raw' ? 'default' :
                                                    file.dataLakeFileLevel === 'clean' ? 'primary' : 'secondary'
                                                }
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{formatFileSize(file.sizeInBytes)}</TableCell>
                                        <TableCell>{file.contentType || '-'}</TableCell>
                                        <TableCell>{formatDate(file.uploadedAt)}</TableCell>
                                        <TableCell>{file.fileVersion?.versionNumber || '-'}</TableCell>
                                        <TableCell>
                                            <Tooltip title="Baixar arquivo">
                                                <IconButton
                                                    onClick={() => handleDownload(file.id!, file.fileName)}
                                                    color="primary"
                                                    size="small"
                                                    disabled={downloadingFileId === file.id}
                                                >
                                                    {downloadingFileId === file.id ? (
                                                        <CircularProgress size={20} />
                                                    ) : (
                                                        <DownloadIcon />
                                                    )}
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {pagination.totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <Pagination
                                count={pagination.totalPages}
                                page={pagination.page + 1}
                                onChange={handlePageChange}
                                color="primary"
                            />
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Toast Notification */}
            <Snackbar
                open={toastOpen}
                autoHideDuration={toastSeverity === 'success' ? 4000 : 6000}
                onClose={handleCloseToast}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseToast}
                    severity={toastSeverity}
                    sx={{ width: '100%' }}
                    variant="filled"
                >
                    {toastMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};
