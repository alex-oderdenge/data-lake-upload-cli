"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
} from "@mui/material";
import { DatasetKeyService, DatasetKey, DatasetKeyWithFiles } from "@/service/DatasetKeyService";
import { CustomerService, Customer } from "@/service/CustomerService";

const DATA_LAKE_LEVELS = [
  { value: "RAW", label: "RAW - Dados brutos" },
  { value: "CLEAN", label: "CLEAN - Dados convertidos/unificados" },
  { value: "STANDARDIZED", label: "STANDARDIZED - Dados harmonizados" },
];

const MONTHS = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

export function EmptyDatasetKeys() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number | "">("");
  const [selectedDataLakeLevel, setSelectedDataLakeLevel] = useState<string>("RAW");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [emptyDatasetKeys, setEmptyDatasetKeys] = useState<DatasetKey[]>([]);
  const [datasetKeysWithFiles, setDatasetKeysWithFiles] = useState<DatasetKeyWithFiles[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load customers on component mount
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const customersResponse = await CustomerService.getCustomers();
        setCustomers(customersResponse.content);
      } catch (err) {
        setError("Erro ao carregar clientes");
        console.error("Error loading customers:", err);
      }
    };

    loadCustomers();
  }, []);

  // Load dataset keys when filters change
  useEffect(() => {
    if (selectedCustomer && selectedDataLakeLevel && selectedYear && selectedMonth) {
      loadEmptyDatasetKeys();
    } else {
      setEmptyDatasetKeys([]);
      setDatasetKeysWithFiles([]);
    }
  }, [selectedCustomer, selectedDataLakeLevel, selectedYear, selectedMonth]);

  const loadEmptyDatasetKeys = async () => {
    if (!selectedCustomer || !selectedDataLakeLevel || !selectedYear || !selectedMonth) return;

    setLoading(true);
    setError(null);

    try {
      const [emptyKeys, keysWithFiles] = await Promise.all([
        DatasetKeyService.getEmptyDatasetKeys(
          selectedCustomer as number,
          selectedDataLakeLevel,
          selectedYear,
          selectedMonth
        ),
        DatasetKeyService.getDatasetKeysWithFiles(
          selectedCustomer as number,
          selectedDataLakeLevel,
          selectedYear,
          selectedMonth
        )
      ]);
      setEmptyDatasetKeys(emptyKeys);
      setDatasetKeysWithFiles(keysWithFiles);
    } catch (err) {
      setError("Erro ao carregar dataset keys");
      console.error("Error loading dataset keys:", err);
    } finally {
      setLoading(false);
    }
  };

  const getDataLakeLevelLabel = (level: string) => {
    const found = DATA_LAKE_LEVELS.find(l => l.value === level);
    return found ? found.label : level;
  };

  const getDataLakeLevelColor = (level: string) => {
    switch (level) {
      case "RAW":
        return "default";
      case "CLEAN":
        return "warning";
      case "STANDARDIZED":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Dataset Keys Pendentes de Upload
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Visualize as dataset keys que ainda não possuem arquivos para um cliente, nível e período específico
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ minWidth: 200, flex: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Cliente</InputLabel>
            <Select
              value={selectedCustomer}
              label="Cliente"
              onChange={(e) => setSelectedCustomer(e.target.value as number | "")}
            >
              {customers.map((customer) => (
                <MenuItem key={customer.id} value={customer.id}>
                  {customer.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ minWidth: 200, flex: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Nível do Data Lake</InputLabel>
            <Select
              value={selectedDataLakeLevel}
              label="Nível do Data Lake"
              onChange={(e) => setSelectedDataLakeLevel(e.target.value)}
            >
              {DATA_LAKE_LEVELS.map((level) => (
                <MenuItem key={level.value} value={level.value}>
                  {level.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ minWidth: 120, flex: 0.5 }}>
          <FormControl fullWidth>
            <InputLabel>Ano</InputLabel>
            <Select
              value={selectedYear}
              label="Ano"
              onChange={(e) => setSelectedYear(e.target.value as number)}
            >
              {Array.from({ length: 10 }, (_, i) => {
                const year = new Date().getFullYear() - 5 + i;
                return (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ minWidth: 120, flex: 0.5 }}>
          <FormControl fullWidth>
            <InputLabel>Mês</InputLabel>
            <Select
              value={selectedMonth}
              label="Mês"
              onChange={(e) => setSelectedMonth(e.target.value as number)}
            >
              {MONTHS.map((month) => (
                <MenuItem key={month.value} value={month.value}>
                  {month.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box display="flex" justifyContent="center" sx={{ py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && selectedCustomer && selectedDataLakeLevel && (
        <Card sx={{ 
          backgroundColor: '#fff3e0',
          border: '1px solid',
          borderColor: '#ffb74d'
        }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
              <Typography variant="h6" color="warning.main">
                ⚠️ Dataset Keys sem arquivos
              </Typography>
              <Chip
                label={getDataLakeLevelLabel(selectedDataLakeLevel)}
                color={getDataLakeLevelColor(selectedDataLakeLevel) as any}
                size="small"
              />
              <Chip
                label={`${emptyDatasetKeys.length} dataset keys`}
                variant="outlined"
                color="warning"
                size="small"
              />
            </Box>

            {emptyDatasetKeys.length === 0 ? (
              <Alert severity="success">
                Todas as dataset keys possuem arquivos para este cliente e nível!
              </Alert>
            ) : (
              <TableContainer 
                component={Paper} 
                variant="outlined"
                sx={{ 
                  backgroundColor: '#fff8e1',
                  border: '1px solid',
                  borderColor: '#ffcc02'
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#ffecb3' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: '#e65100' }}>Nome</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#e65100' }}>Descrição</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#e65100' }}>Path Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#e65100' }}>Criado em</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {emptyDatasetKeys.map((datasetKey) => (
                      <TableRow key={datasetKey.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {datasetKey.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {datasetKey.description || "Sem descrição"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {datasetKey.pathName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {datasetKey.createdAt
                              ? new Date(datasetKey.createdAt).toLocaleDateString("pt-BR")
                              : "N/A"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {!loading && selectedCustomer && selectedDataLakeLevel && (
        <Card sx={{ 
          mt: 3,
          backgroundColor: '#e8f5e8',
          border: '1px solid',
          borderColor: '#81c784'
        }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
              <Typography variant="h6" color="success.main">
                ✅ Dataset Keys com arquivos
              </Typography>
              <Chip
                label={getDataLakeLevelLabel(selectedDataLakeLevel)}
                color={getDataLakeLevelColor(selectedDataLakeLevel) as any}
                size="small"
              />
              <Chip
                label={`${datasetKeysWithFiles.length} dataset keys`}
                variant="outlined"
                color="success"
                size="small"
              />
            </Box>

            {datasetKeysWithFiles.length === 0 ? (
              <Alert severity="info">
                Nenhuma dataset key possui arquivos para este cliente e nível
              </Alert>
            ) : (
              <TableContainer 
                component={Paper} 
                variant="outlined"
                sx={{ 
                  backgroundColor: '#f1f8e9',
                  border: '1px solid',
                  borderColor: '#a5d6a7'
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#c8e6c9' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: '#2e7d32' }}>Nome</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#2e7d32' }}>Descrição</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#2e7d32' }}>Path Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#2e7d32' }}>Arquivos ({datasetKeysWithFiles.reduce((sum, dk) => sum + dk.fileCount, 0)})</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#2e7d32' }}>Criado em</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {datasetKeysWithFiles.map((datasetKey) => (
                      <TableRow key={datasetKey.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {datasetKey.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {datasetKey.description || "Sem descrição"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {datasetKey.pathName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Chip
                              label={`${datasetKey.fileCount} arquivo(s)`}
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ mb: 1 }}
                            />
                            <Box sx={{ maxHeight: 100, overflow: 'auto' }}>
                              {datasetKey.fileNames.map((fileName, index) => (
                                <Typography
                                  key={index}
                                  variant="caption"
                                  display="block"
                                  sx={{ 
                                    fontFamily: 'monospace',
                                    fontSize: '0.75rem',
                                    color: 'text.secondary',
                                    mb: 0.5
                                  }}
                                >
                                  • {fileName}
                                </Typography>
                              ))}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {datasetKey.createdAt
                              ? new Date(datasetKey.createdAt).toLocaleDateString("pt-BR")
                              : "N/A"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {(!selectedCustomer || !selectedYear || !selectedMonth) && (
        <Alert severity="info">
          Selecione um cliente, nível do data lake, ano e mês para visualizar as dataset keys pendentes
        </Alert>
      )}
    </Box>
  );
}
