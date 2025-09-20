"use client";
import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Card, 
    CardContent, 
    TextField, 
    Button, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Pagination, 
    Grid, 
    Alert,
    CircularProgress,
    IconButton,
    Tooltip,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { DatasetKeyService, DatasetKey, DatasetKeyCreateRequest } from '@/service/DatasetKeyService';

export const DatasetKeyManagement: React.FC = () => {
    const [datasetKeys, setDatasetKeys] = useState<DatasetKey[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0
    });

    // Form states
    const [formData, setFormData] = useState<DatasetKeyCreateRequest>({
        name: '',
        description: '',
        pathName: ''
    });
    const [editingDatasetKey, setEditingDatasetKey] = useState<DatasetKey | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [datasetKeyToDelete, setDatasetKeyToDelete] = useState<DatasetKey | null>(null);

    // Toast states
    const [toastMessage, setToastMessage] = useState('');
    const [toastOpen, setToastOpen] = useState(false);
    const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('error');

    // Load dataset keys on component mount
    useEffect(() => {
        loadDatasetKeys();
    }, []);

    const loadDatasetKeys = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await DatasetKeyService.getDatasetKeys(pagination.page, pagination.size);
            setDatasetKeys(response.content);
            setPagination(prev => ({
                ...prev,
                totalElements: response.totalElements,
                totalPages: Math.ceil(response.totalElements / pagination.size)
            }));
        } catch (error: any) {
            console.error('Load dataset keys error:', error);
            setError('Erro ao carregar chaves de dataset');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
        setPagination(prev => ({ ...prev, page: page - 1 }));
        loadDatasetKeys();
    };

    const handleInputChange = (field: keyof DatasetKeyCreateRequest, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCreateDatasetKey = async () => {
        if (!formData.name.trim()) {
            setToastMessage('Nome da chave de dataset é obrigatório');
            setToastSeverity('error');
            setToastOpen(true);
            return;
        }

        try {
            await DatasetKeyService.createDatasetKey(formData);
            setToastMessage('Chave de dataset criada com sucesso!');
            setToastSeverity('success');
            setToastOpen(true);
            setDialogOpen(false);
            setFormData({ name: '', description: '', pathName: '' });
            loadDatasetKeys();
        } catch (error: any) {
            console.error('Create dataset key error:', error);
            setToastMessage('Erro ao criar chave de dataset');
            setToastSeverity('error');
            setToastOpen(true);
        }
    };

    const handleEditDatasetKey = async () => {
        if (!editingDatasetKey || !formData.name.trim()) {
            setToastMessage('Nome da chave de dataset é obrigatório');
            setToastSeverity('error');
            setToastOpen(true);
            return;
        }

        try {
            await DatasetKeyService.updateDatasetKey(editingDatasetKey.id!, formData);
            setToastMessage('Chave de dataset atualizada com sucesso!');
            setToastSeverity('success');
            setToastOpen(true);
            setDialogOpen(false);
            setEditingDatasetKey(null);
            setFormData({ name: '', description: '', pathName: '' });
            loadDatasetKeys();
        } catch (error: any) {
            console.error('Update dataset key error:', error);
            setToastMessage('Erro ao atualizar chave de dataset');
            setToastSeverity('error');
            setToastOpen(true);
        }
    };

    const handleDeleteDatasetKey = async () => {
        if (!datasetKeyToDelete) return;

        try {
            await DatasetKeyService.deleteDatasetKey(datasetKeyToDelete.id!);
            setToastMessage('Chave de dataset excluída com sucesso!');
            setToastSeverity('success');
            setToastOpen(true);
            setDeleteDialogOpen(false);
            setDatasetKeyToDelete(null);
            loadDatasetKeys();
        } catch (error: any) {
            console.error('Delete dataset key error:', error);
            setToastMessage('Erro ao excluir chave de dataset');
            setToastSeverity('error');
            setToastOpen(true);
        }
    };

    const openCreateDialog = () => {
        setEditingDatasetKey(null);
        setFormData({ name: '', description: '', pathName: '' });
        setDialogOpen(true);
    };

    const openEditDialog = (datasetKey: DatasetKey) => {
        setEditingDatasetKey(datasetKey);
        setFormData({
            name: datasetKey.name,
            description: datasetKey.description || '',
            pathName: datasetKey.pathName || ''
        });
        setDialogOpen(true);
    };

    const openDeleteDialog = (datasetKey: DatasetKey) => {
        setDatasetKeyToDelete(datasetKey);
        setDeleteDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setEditingDatasetKey(null);
        setFormData({ name: '', description: '', pathName: '' });
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h5" component="h2" gutterBottom>
                Gerenciamento de Chaves de Dataset
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Actions */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={openCreateDialog}
                        >
                            Nova Chave de Dataset
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={loadDatasetKeys}
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
                            Chaves de Dataset ({pagination.totalElements} registros)
                        </Typography>
                        {loading && <CircularProgress size={24} />}
                    </Box>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Nome</TableCell>
                                    <TableCell>Descrição</TableCell>
                                    <TableCell>Path Name</TableCell>
                                    <TableCell>Criado em</TableCell>
                                    <TableCell>Atualizado em</TableCell>
                                    <TableCell>Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {datasetKeys.map((datasetKey) => (
                                    <TableRow key={datasetKey.id}>
                                        <TableCell>
                                            <Tooltip title={datasetKey.id?.toString() || 'ID não disponível'}>
                                                <Typography variant="body2" noWrap>
                                                    {datasetKey.id}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={datasetKey.name || 'Nome não disponível'}>
                                                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                                    {datasetKey.name}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={datasetKey.description || 'Sem descrição'}>
                                                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                                    {datasetKey.description || '-'}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={datasetKey.pathName || 'Path name não disponível'}>
                                                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                                    {datasetKey.pathName || '-'}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={formatDate(datasetKey.createdAt) || 'Data não disponível'}>
                                                <Typography variant="body2" noWrap>
                                                    {formatDate(datasetKey.createdAt)}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={formatDate(datasetKey.updatedAt) || 'Data não disponível'}>
                                                <Typography variant="body2" noWrap>
                                                    {formatDate(datasetKey.updatedAt)}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Editar chave de dataset">
                                                <IconButton
                                                    onClick={() => openEditDialog(datasetKey)}
                                                    color="primary"
                                                    size="small"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Excluir chave de dataset">
                                                <IconButton
                                                    onClick={() => openDeleteDialog(datasetKey)}
                                                    color="error"
                                                    size="small"
                                                >
                                                    <DeleteIcon />
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

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingDatasetKey ? 'Editar Chave de Dataset' : 'Nova Chave de Dataset'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nome *"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Descrição"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                variant="outlined"
                                multiline
                                rows={3}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Path Name"
                                value={formData.pathName}
                                onChange={(e) => handleInputChange('pathName', e.target.value)}
                                variant="outlined"
                                helperText="Nome usado em URLs e caminhos de arquivo"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Cancelar</Button>
                    <Button 
                        onClick={editingDatasetKey ? handleEditDatasetKey : handleCreateDatasetKey}
                        variant="contained"
                    >
                        {editingDatasetKey ? 'Atualizar' : 'Criar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Tem certeza que deseja excluir a chave de dataset "{datasetKeyToDelete?.name}"? 
                        Esta ação não pode ser desfeita.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleDeleteDatasetKey} color="error" variant="contained">
                        Excluir
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Toast Notification */}
            <Snackbar
                open={toastOpen}
                autoHideDuration={4000}
                onClose={() => setToastOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setToastOpen(false)}
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
