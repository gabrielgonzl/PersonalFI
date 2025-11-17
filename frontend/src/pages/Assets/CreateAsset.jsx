import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { assetSchema } from '../../utils/validators';
import { useCreateAsset } from '../../hooks/useAssets';
import { usePortfolios } from '../../hooks/usePortfolios';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Select, Textarea } from '../../components/common/Input';
import { ASSET_TYPES, ASSET_TYPE_LABELS, CURRENCIES } from '../../config/constants';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export const CreateAsset = () => {
  const navigate = useNavigate();
  const { currency: defaultCurrency, showSuccess, showError } = useApp();
  const { data: portfoliosData } = usePortfolios();
  const createAssetMutation = useCreateAsset();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: '',
      symbol: '',
      type: ASSET_TYPES.STOCK,
      currency: defaultCurrency,
      portfolioId: '',
      notes: '',
      color: '#0ea5e9',
      icon: '',
    },
  });

  const portfolios = Array.isArray(portfoliosData?.data) ? portfoliosData.data : [];

  const onSubmit = async (data) => {
    try {
      if (!data.portfolioId) delete data.portfolioId;
      if (!data.notes) delete data.notes;
      if (!data.icon) delete data.icon;

      const result = await createAssetMutation.mutateAsync(data);
      showSuccess('Activo creado exitosamente');
      navigate(`/assets/${result.data._id}`);
    } catch (error) {
      showError(error.message || 'Error al crear el activo');
    }
  };

  const assetTypeOptions = Object.entries(ASSET_TYPE_LABELS).map(([value, label]) => ({ value, label }));
  const currencyOptions = CURRENCIES.map(curr => ({ value: curr, label: curr }));
  const portfolioOptions = [
    { value: '', label: 'Sin Cartera (Independiente)' },
    ...portfolios.map(p => ({ value: p._id, label: p.name })),
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center space-x-3">
        <Button variant="ghost" onClick={() => navigate('/assets')} className="p-2">
          <ArrowBackIcon />
        </Button>
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-primary-100 rounded-lg">
            <TrendingUpIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Activo</h1>
            <p className="text-sm text-gray-600 mt-0.5">Agrega un nuevo activo de inversión a tu cartera</p>
          </div>
        </div>
      </div>

      <Card className="shadow-md">
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-3 mb-5">
          <p className="text-sm text-primary-800 font-medium">
            Define los datos básicos de tu activo. Podrás registrar transacciones después.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Nombre del Activo *"
              {...register('name')}
              error={errors.name?.message}
              placeholder="ej., Bitcoin, Apple Inc."
              helperText="Nombre completo del activo"
            />

            <Input
              label="Símbolo/Ticker *"
              {...register('symbol')}
              error={errors.symbol?.message}
              placeholder="ej., BTC, AAPL"
              helperText="Identificador corto"
            />

            <Select
              label="Tipo de Activo *"
              {...register('type')}
              options={assetTypeOptions}
              error={errors.type?.message}
            />

            <Select
              label="Moneda *"
              {...register('currency')}
              options={currencyOptions}
              error={errors.currency?.message}
            />

            <Select
              label="Cartera"
              {...register('portfolioId')}
              options={portfolioOptions}
              error={errors.portfolioId?.message}
              helperText="Opcional: asignar a una cartera"
            />

            <Input
              label="Color de Identificación"
              type="color"
              {...register('color')}
              error={errors.color?.message}
              helperText="Para visualización en gráficos"
            />
          </div>

          <Textarea
            label="Notas"
            {...register('notes')}
            error={errors.notes?.message}
            placeholder="Información adicional sobre este activo..."
            rows={3}
            helperText="Opcional: estrategia, objetivos, etc."
          />

          <div className="flex justify-end space-x-3 pt-5 border-t border-gray-200">
            <Button variant="outline" onClick={() => navigate('/assets')} type="button">
              Cancelar
            </Button>
            <Button type="submit" loading={createAssetMutation.isLoading}>
              Crear Activo
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
