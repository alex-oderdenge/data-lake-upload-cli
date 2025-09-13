"use client";
import { Container, Typography, Box, Paper } from "@mui/material";
import { FileUpload } from "./components/fileUpload";

export default function Home() {
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Data Lake Upload CLI
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Faça upload de arquivos para o Data Lake para serem utilizados no pipeline de migração de dados
        </Typography>
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            File Upload
          </Typography>
          <FileUpload
            onUploadSuccess={(result) => console.log('Upload successful:', result)}
            onUploadError={(error) => console.error('Upload failed:', error)}
          />
        </Paper>
      </Box>
    </Container>
  );
}
