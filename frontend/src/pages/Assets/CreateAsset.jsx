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
      showSuccess('Asset created successfully');
      navigate(`/assets/${result.data._id}`);
    } catch (error) {
      showError(error.message || 'Failed to create asset');
    }
  };

  const assetTypeOptions = Object.entries(ASSET_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const currencyOptions = CURRENCIES.map(curr => ({ value: curr, label: curr }));

  const portfolioOptions = [
    { value: '', label: 'No Portfolio (Independent)' },
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
          <h1 className="text-3xl font-bold text-gray-900">Create New Asset</h1>
          <p className="text-gray-600 mt-1">Add a new investment asset to your portfolio</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Asset Name *"
              {...register('name')}
              error={errors.name?.message}
              placeholder="e.g., Bitcoin, Apple Inc."
            />

            <Input
              label="Symbol *"
              {...register('symbol')}
              error={errors.symbol?.message}
              placeholder="e.g., BTC, AAPL"
            />

            <Select
              label="Asset Type *"
              {...register('type')}
              options={assetTypeOptions}
              error={errors.type?.message}
            />

            <Select
              label="Currency *"
              {...register('currency')}
              options={currencyOptions}
              error={errors.currency?.message}
            />

            <Select
              label="Portfolio"
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
            label="Notes"
            {...register('notes')}
            error={errors.notes?.message}
            placeholder="Optional notes about this asset"
            rows={3}
          />

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => navigate('/assets')} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={createAssetMutation.isLoading}>
              Create Asset
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
