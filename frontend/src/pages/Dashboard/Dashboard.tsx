import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  LocalGasStation,
  Assessment,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { operationService } from '../../services/api';
import type { OperationSummary, OperationFilters } from '../../types';
import { Layout } from '../../components/Layout/Layout';

export function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<OperationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<OperationFilters>({});
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  // carrega resumo das operacoes
  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await operationService.getSummary(filters);
      setSummary(data);
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
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

  if (loading) {
    return (
      <Layout>
        <Typography>Carregando...</Typography>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        
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
            
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="contained"
                onClick={() => navigate('/operations/new')}
                fullWidth
                size="small"
              >
                Nova Operação
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* cards de resumo */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Assessment color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total de Operações
                    </Typography>
                    <Typography variant="h5">
                      {summary?.totalOperacoes || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendingUp color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Compras
                    </Typography>
                    <Typography variant="h5">
                      R$ {summary?.resumo.totalCompras?.toFixed(2) || '0.00'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendingDown color="error" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Vendas
                    </Typography>
                    <Typography variant="h5">
                      R$ {summary?.resumo.totalVendas?.toFixed(2) || '0.00'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <LocalGasStation color={summary?.resumo.resultado === 'LUCRO' ? 'success' : summary?.resumo.resultado === 'PREJUIZO' ? 'error' : 'warning'} sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Resultado
                    </Typography>
                    <Typography variant="h5" color={summary?.resumo.resultado === 'LUCRO' ? 'success.main' : summary?.resumo.resultado === 'PREJUIZO' ? 'error.main' : 'warning.main'}>
                      {summary?.resumo.resultado || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      R$ {summary?.resumo.diferenca?.toFixed(2) || '0.00'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* resumo por combustivel */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Por Tipo de Combustível
              </Typography>
              
              <Grid container spacing={2}>
                {summary?.porCombustivel.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.combustivel}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {item.combustivel}
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        Compras: R$ {item.compras.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="error.main">
                        Vendas: R$ {item.vendas.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" color={item.diferenca >= 0 ? 'success.main' : 'error.main'}>
                        Diferença: R$ {item.diferenca.toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                )) || (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Nenhum dado disponível
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
}