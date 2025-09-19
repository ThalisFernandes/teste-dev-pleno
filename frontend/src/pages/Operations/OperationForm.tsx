import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { operationService } from '../../services/api';
import { Operation } from '../../types';
import { Layout } from '../../components/Layout/Layout';

// schema de validacao
const operationSchema = z.object({
  type: z.enum(['BUY', 'SELL'], { required_error: 'Tipo é obrigatório' }),
  fuelType: z.enum(['GASOLINE', 'ETHANOL', 'DIESEL'], { required_error: 'Combustível é obrigatório' }),
  quantity: z.number().min(0.01, 'Quantidade deve ser maior que 0'),
  unitPrice: z.number().min(0.01, 'Preço deve ser maior que 0'),
  date: z.string().min(1, 'Data é obrigatória'),
});

type OperationFormData = z.infer<typeof operationSchema>;

export function OperationForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [operation, setOperation] = useState<Operation | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OperationFormData>({
    resolver: zodResolver(operationSchema),
    defaultValues: {
      date: dayjs().format('YYYY-MM-DD'),
    },
  });

  // carrega operacao se for edicao
  useEffect(() => {
    if (isEdit && id) {
      loadOperation();
    }
  }, [isEdit, id]);

  const loadOperation = async () => {
    try {
      setLoading(true);
      const data = await operationService.getOperation(id!);
      setOperation(data);
      
      // preenche o form
      setValue('type', data.type);
      setValue('fuelType', data.fuelType);
      setValue('quantity', data.quantity);
      setValue('unitPrice', data.unitPrice);
      setValue('date', data.date);
      setSelectedDate(dayjs(data.date));
    } catch (error) {
      console.error('Erro ao carregar operação:', error);
      setError('Erro ao carregar operação');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: OperationFormData) => {
    try {
      setLoading(true);
      setError('');
      
      if (isEdit && id) {
        await operationService.updateOperation(id, data);
      } else {
        await operationService.createOperation(data);
      }
      
      navigate('/operations');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar operação');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (value: Dayjs | null) => {
    setSelectedDate(value);
    setValue('date', value?.format('YYYY-MM-DD') || '');
  };

  // calcula valor total automaticamente
  const quantity = watch('quantity');
  const unitPrice = watch('unitPrice');
  const totalValue = (quantity && unitPrice) ? quantity * unitPrice : 0;

  return (
    <Layout>
      <Box>
        <Typography variant="h4" gutterBottom>
          {isEdit ? 'Editar Operação' : 'Nova Operação'}
        </Typography>

        <Paper sx={{ p: 4, maxWidth: 600 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.type}>
                  <InputLabel>Tipo de Operação</InputLabel>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Tipo de Operação"
                      >
                        <MenuItem value="BUY">Compra</MenuItem>
                        <MenuItem value="SELL">Venda</MenuItem>
                      </Select>
                    )}
                  />
                  {errors.type && (
                    <Typography variant="caption" color="error">
                      {errors.type.message}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.fuelType}>
                  <InputLabel>Tipo de Combustível</InputLabel>
                  <Controller
                    name="fuelType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Tipo de Combustível"
                      >
                        <MenuItem value="GASOLINE">Gasolina</MenuItem>
                        <MenuItem value="ETHANOL">Etanol</MenuItem>
                        <MenuItem value="DIESEL">Diesel</MenuItem>
                      </Select>
                    )}
                  />
                  {errors.fuelType && (
                    <Typography variant="caption" color="error">
                      {errors.fuelType.message}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Quantidade (Litros)"
                  type="number"
                  inputProps={{ step: 0.01, min: 0 }}
                  error={!!errors.quantity}
                  helperText={errors.quantity?.message}
                  {...register('quantity', { valueAsNumber: true })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Preço Unitário (R$)"
                  type="number"
                  inputProps={{ step: 0.01, min: 0 }}
                  error={!!errors.unitPrice}
                  helperText={errors.unitPrice?.message}
                  {...register('unitPrice', { valueAsNumber: true })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Data da Operação"
                    value={selectedDate}
                    onChange={handleDateChange}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true,
                        error: !!errors.date,
                        helperText: errors.date?.message
                      } 
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Valor Total"
                  value={`R$ ${totalValue.toFixed(2)}`}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="filled"
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/operations')}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {loading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
}