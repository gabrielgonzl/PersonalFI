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

  const portfolios = portfoliosData?.data || [];

  const onSubmit = async (data) => {
    try {
      // Remove empty optional fields
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

  const assetTypeOptions = Object.entries(ASSET_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const currencyOptions = CURRENCIES.map(curr => ({ value: curr, label: curr }));

  const portfolioOptions = [
    { value: '', label: 'Sin Cartera (Independiente)' },
    ...portfolios.map(p => ({ value: p._id, label: p.name })),
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/assets')}>
          <ArrowBackIcon />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Activo</h1>
          <p className="text-gray-600 mt-1">Agrega un nuevo activo de inversión a tu cartera</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre del Activo *"
              {...register('name')}
              error={errors.name?.message}
              placeholder="ej., Bitcoin, Apple Inc."
            />

            <Input
              label="Símbolo *"
              {...register('symbol')}
              error={errors.symbol?.message}
              placeholder="ej., BTC, AAPL"
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
            />

            <Input
              label="Color"
              type="color"
              {...register('color')}
              error={errors.color?.message}
            />
          </div>

          <Textarea
            label="Notas"
            {...register('notes')}
            error={errors.notes?.message}
            placeholder="Notas opcionales sobre este activo"
            rows={3}
          />

          <div className="flex justify-end space-x-3 pt-4 border-t">
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
