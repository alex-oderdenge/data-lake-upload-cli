"use client";
import { Container, Typography, Box, Paper, Tabs, Tab } from "@mui/material";
import { useState } from "react";
import { FileUpload } from "./components/fileUpload";
import { FileList } from "./components/fileList";
import { FileDownload } from "./components/fileDownload";
import { CustomerManagement } from "./components/customerManagement";
import { DatasetKeyManagement } from "./components/datasetKeyManagement";
import { EmptyDatasetKeys } from "./components/emptyDatasetKeys";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Home() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Data Lake Upload CLI
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Faça upload de arquivos para o Data Lake e gerencie seus arquivos existentes
        </Typography>
        
        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="data lake tabs">
              <Tab label="Upload de Arquivo" />
              <Tab label="Lista de Arquivos" />
              <Tab label="Download por Filtros" />
              <Tab label="Clientes" />
              <Tab label="Chaves de Dataset" />
              <Tab label="Dataset Keys Pendentes" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ px: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Upload de Arquivo
              </Typography>
              <FileUpload
                onUploadSuccess={(result) => console.log('Upload successful:', result)}
                onUploadError={(error) => console.error('Upload failed:', error)}
              />
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ px: 3 }}>
              <FileList />
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ px: 3 }}>
              <FileDownload />
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ px: 3 }}>
              <CustomerManagement />
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={4}>
            <Box sx={{ px: 3 }}>
              <DatasetKeyManagement />
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={5}>
            <Box sx={{ px: 3 }}>
              <EmptyDatasetKeys />
            </Box>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
}
