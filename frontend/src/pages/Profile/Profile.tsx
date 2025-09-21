import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from '../../components/Layout/Layout';
import { userService } from '../../services/api';
import { User } from '../../types/auth';

export function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState<User | null>(null);

  // carrega dados do perfil
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const profile = await userService.getProfile();
        setUserProfile(profile);
      } catch (err: any) {
        setError('Erro ao carregar perfil');
        console.error('Erro ao carregar perfil:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Meu Perfil
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* informacoes basicas */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Informações Pessoais
              </Typography>
              
              <Box component="form" sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nome"
                      value={userProfile?.name || ''}
                      InputProps={{
                        readOnly: true,
                      }}
                      variant="filled"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={userProfile?.email || ''}
                      InputProps={{
                        readOnly: true,
                      }}
                      variant="filled"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Data de Cadastro"
                      value={userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('pt-BR') : ''}
                      InputProps={{
                        readOnly: true,
                      }}
                      variant="filled"
                    />
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* estatisticas */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Estatísticas
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Total de Operações:
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {userProfile?._count?.operations || 0}
                  </Typography>
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  Operações registradas desde o cadastro
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* aq poderia ter mais funcionalidades como alterar senha, etc */}
        <Box mt={4}>
          <Typography variant="body2" color="text.secondary" align="center">
            Para alterar suas informações, entre em contato com o administrador.
          </Typography>
        </Box>
      </Container>
    </Layout>
  );
}