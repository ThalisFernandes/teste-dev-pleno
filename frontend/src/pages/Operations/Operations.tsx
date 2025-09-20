import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { operationService } from '../../services/api';
import type { Operation, OperationFilters } from '../../types';
import { Layout } from '../../components/Layout/Layout';

export function Operations() {
  const navigate = useNavigate();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    operation: Operation | null;
  }>({ open: false, operation: null });
  
  // filtros
  const [filters, setFilters] = useState<OperationFilters>({});
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  // carrega operacoes
  const loadOperations = async () => {
    try {
      setLoading(true);
      const data = await operationService.getOperations(filters);
      setOperations(data);
    } catch (error) {
      console.error('Erro ao carregar operações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOperations();
  }, [filters]);

  const handleFilterChange = (field: keyof OperationFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: Dayjs | null) => {
    if (field === 'startDate') {
      setStartDate(value);
      handleFilterChange('startDate', value?.format('YYYY-MM-DD'));
    } else {
      setEndDate(value);
      handleFilterChange('endDate', value?.format('YYYY-MM-DD'));
    }
  };

  const clearFilters = () => {
    setFilters({});
    setStartDate(null);
    setEndDate(null);
  };

  const handleDelete = async () => {
    if (!deleteDialog.operation) return;
    
    try {
      await operationService.deleteOperation(deleteDialog.operation.id);
      setDeleteDialog({ open: false, operation: null });
      loadOperations(); // recarrega a lista
    } catch (error) {
      console.error('Erro ao deletar operação:', error);
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'COMPRA' ? 'success' : 'error';
  };

  const getTypeLabel = (type: string) => {
    return type === 'COMPRA' ? 'Compra' : 'Venda';
  };

  const getFuelTypeLabel = (fuelType: string) => {
    const labels = {
      GASOLINA: 'Gasolina',
      ETANOL: 'Etanol',
      DIESEL: 'Diesel',
    };
    return labels[fuelType as keyof typeof labels] || fuelType;
  };

  return (
    <Layout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Operações
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/operations/new')}
          >
            Nova Operação
          </Button>
        </Box>

        {/* filtros */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filtros
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={filters.type || ''}
                  label="Tipo"
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="COMPRA">Compra</MenuItem>
                    <MenuItem value="VENDA">Venda</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Combustível</InputLabel>
                <Select
                  value={filters.fuelType || ''}
                  label="Combustível"
                  onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="GASOLINA">Gasolina</MenuItem>
                    <MenuItem value="ETANOL">Etanol</MenuItem>
                  <MenuItem value="DIESEL">Diesel</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Data inicial"
                  value={startDate}
                  onChange={(value) => handleDateChange('startDate', value)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Data final"
                  value={endDate}
                  onChange={(value) => handleDateChange('endDate', value)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="outlined"
                onClick={clearFilters}
                fullWidth
                size="small"
              >
                Limpar
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* tabela */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tipo</TableCell>
                <TableCell>Combustível</TableCell>
                <TableCell align="right">Quantidade (L)</TableCell>
                <TableCell align="right">Preço Unitário</TableCell>
                <TableCell align="right">Valor Total</TableCell>
                <TableCell>Data</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : operations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Nenhuma operação encontrada
                  </TableCell>
                </TableRow>
              ) : (
                operations.map((operation) => (
                  <TableRow key={operation.id}>
                    <TableCell>
                      <Chip
                        label={getTypeLabel(operation.type)}
                        color={getTypeColor(operation.type) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{getFuelTypeLabel(operation.fuelType)}</TableCell>
                    <TableCell align="right">
                      {operation.quantity.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      R$ {operation.pricePerLiter.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      R$ {operation.totalValue.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {dayjs(operation.date).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/operations/${operation.id}`)}
                        title="Visualizar"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/operations/${operation.id}/edit`)}
                        title="Editar"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setDeleteDialog({ open: true, operation })}
                        title="Excluir"
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* dialog de confirmacao de exclusao */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, operation: null })}
        >
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogContent>
            Tem certeza que deseja excluir esta operação? Esta ação não pode ser desfeita.
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDeleteDialog({ open: false, operation: null })}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              color="error"
              variant="contained"
            >
              Excluir
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}