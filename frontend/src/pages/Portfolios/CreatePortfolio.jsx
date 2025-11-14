import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { portfolioSchema } from '../../utils/validators';
import { useCreatePortfolio } from '../../hooks/usePortfolios';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Select, Textarea } from '../../components/common/Input';
import { CURRENCIES } from '../../config/constants';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const CreatePortfolio = () => {
  const navigate = useNavigate();
  const { currency: defaultCurrency, showSuccess, showError } = useApp();

  const createPortfolioMutation = useCreatePortfolio();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      name: '',
      description: '',
      currency: defaultCurrency,
      cashBalance: 0,
      color: '#0ea5e9',
      icon: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      // Remove empty optional fields
      if (!data.description) delete data.description;
      if (!data.icon) delete data.icon;

      const result = await createPortfolioMutation.mutateAsync(data);
      showSuccess('Portfolio created successfully');
      navigate(`/portfolios/${result.data._id}`);
    } catch (error) {
      showError(error.message || 'Failed to create portfolio');
    }
  };

  const currencyOptions = CURRENCIES.map(curr => ({ value: curr, label: curr }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/portfolios')}>
          <ArrowBackIcon />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Portfolio</h1>
          <p className="text-gray-600 mt-1">Organize your investments into a portfolio</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Portfolio Name *"
            {...register('name')}
            error={errors.name?.message}
            placeholder="e.g., My Crypto Portfolio, Retirement Fund"
          />

          <Textarea
            label="Description"
            {...register('description')}
            error={errors.description?.message}
            placeholder="Optional description for this portfolio"
            rows={3}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Currency *"
              {...register('currency')}
              options={currencyOptions}
              error={errors.currency?.message}
            />

            <Input
              label="Initial Cash Balance"
              type="number"
              step="any"
              {...register('cashBalance', { valueAsNumber: true })}
              error={errors.cashBalance?.message}
              placeholder="0.00"
            />

            <Input
              label="Color"
              type="color"
              {...register('color')}
              error={errors.color?.message}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => navigate('/portfolios')} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={createPortfolioMutation.isLoading}>
              Create Portfolio
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
