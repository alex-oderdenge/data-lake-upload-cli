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
import { CustomerService, Customer, CustomerCreateRequest } from '@/service/CustomerService';

export const CustomerManagement: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0
    });

    // Form states
    const [formData, setFormData] = useState<CustomerCreateRequest>({
        name: '',
        description: '',
        pathName: ''
    });
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

    // Toast states
    const [toastMessage, setToastMessage] = useState('');
    const [toastOpen, setToastOpen] = useState(false);
    const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('error');

    // Load customers on component mount
    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await CustomerService.getCustomers(pagination.page, pagination.size);
            setCustomers(response.content);
            setPagination(prev => ({
                ...prev,
                totalElements: response.totalElements,
                totalPages: Math.ceil(response.totalElements / pagination.size)
            }));
        } catch (error: any) {
            console.error('Load customers error:', error);
            setError('Erro ao carregar clientes');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
        setPagination(prev => ({ ...prev, page: page - 1 }));
        loadCustomers();
    };

    const handleInputChange = (field: keyof CustomerCreateRequest, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCreateCustomer = async () => {
        if (!formData.name.trim()) {
            setToastMessage('Nome do cliente é obrigatório');
            setToastSeverity('error');
            setToastOpen(true);
            return;
        }

        try {
            await CustomerService.createCustomer(formData);
            setToastMessage('Cliente criado com sucesso!');
            setToastSeverity('success');
            setToastOpen(true);
            setDialogOpen(false);
            setFormData({ name: '', description: '', pathName: '' });
            loadCustomers();
        } catch (error: any) {
            console.error('Create customer error:', error);
            setToastMessage('Erro ao criar cliente');
            setToastSeverity('error');
            setToastOpen(true);
        }
    };

    const handleEditCustomer = async () => {
        if (!editingCustomer || !formData.name.trim()) {
            setToastMessage('Nome do cliente é obrigatório');
            setToastSeverity('error');
            setToastOpen(true);
            return;
        }

        try {
            await CustomerService.updateCustomer(editingCustomer.id!, formData);
            setToastMessage('Cliente atualizado com sucesso!');
            setToastSeverity('success');
            setToastOpen(true);
            setDialogOpen(false);
            setEditingCustomer(null);
            setFormData({ name: '', description: '', pathName: '' });
            loadCustomers();
        } catch (error: any) {
            console.error('Update customer error:', error);
            setToastMessage('Erro ao atualizar cliente');
            setToastSeverity('error');
            setToastOpen(true);
        }
    };

    const handleDeleteCustomer = async () => {
        if (!customerToDelete) return;

        try {
            await CustomerService.deleteCustomer(customerToDelete.id!);
            setToastMessage('Cliente excluído com sucesso!');
            setToastSeverity('success');
            setToastOpen(true);
            setDeleteDialogOpen(false);
            setCustomerToDelete(null);
            loadCustomers();
        } catch (error: any) {
            console.error('Delete customer error:', error);
            setToastMessage('Erro ao excluir cliente');
            setToastSeverity('error');
            setToastOpen(true);
        }
    };

    const openCreateDialog = () => {
        setEditingCustomer(null);
        setFormData({ name: '', description: '', pathName: '' });
        setDialogOpen(true);
    };

    const openEditDialog = (customer: Customer) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name,
            description: customer.description || '',
            pathName: customer.pathName || ''
        });
        setDialogOpen(true);
    };

    const openDeleteDialog = (customer: Customer) => {
        setCustomerToDelete(customer);
        setDeleteDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setEditingCustomer(null);
        setFormData({ name: '', description: '', pathName: '' });
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h5" component="h2" gutterBottom>
                Gerenciamento de Clientes
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
                            Novo Cliente
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={loadCustomers}
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
                            Clientes ({pagination.totalElements} registros)
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
                                {customers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell>
                                            <Tooltip title={customer.id?.toString() || 'ID não disponível'}>
                                                <Typography variant="body2" noWrap>
                                                    {customer.id}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={customer.name || 'Nome não disponível'}>
                                                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                                    {customer.name}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={customer.description || 'Sem descrição'}>
                                                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                                    {customer.description || '-'}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={customer.pathName || 'Path name não disponível'}>
                                                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                                    {customer.pathName || '-'}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={formatDate(customer.createdAt) || 'Data não disponível'}>
                                                <Typography variant="body2" noWrap>
                                                    {formatDate(customer.createdAt)}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={formatDate(customer.updatedAt) || 'Data não disponível'}>
                                                <Typography variant="body2" noWrap>
                                                    {formatDate(customer.updatedAt)}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Editar cliente">
                                                <IconButton
                                                    onClick={() => openEditDialog(customer)}
                                                    color="primary"
                                                    size="small"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Excluir cliente">
                                                <IconButton
                                                    onClick={() => openDeleteDialog(customer)}
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
                    {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
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
                        onClick={editingCustomer ? handleEditCustomer : handleCreateCustomer}
                        variant="contained"
                    >
                        {editingCustomer ? 'Atualizar' : 'Criar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Tem certeza que deseja excluir o cliente "{customerToDelete?.name}"? 
                        Esta ação não pode ser desfeita.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleDeleteCustomer} color="error" variant="contained">
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
