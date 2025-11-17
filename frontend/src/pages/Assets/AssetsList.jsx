import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssets } from '../../hooks/useAssets';
import { useTranslation } from '../../hooks/useTranslation';
import { AssetCard } from '../../components/features/AssetCard';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { EmptyState } from '../../components/common/EmptyState';
import { ASSET_TYPES, ASSET_TYPE_LABELS } from '../../config/constants';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export const AssetsList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    type: '',
    portfolioId: '',
    sortBy: 'currentValue',
    sortOrder: 'desc',
  });

  const { data, isLoading, error, refetch } = useAssets(filters);

  const assets = data?.data || [];

  const typeOptions = [
    { value: '', label: t('assets.allTypes') },
    ...Object.entries(ASSET_TYPE_LABELS).map(([value, label]) => ({ value, label })),
  ];

  const sortOptions = [
    { value: 'currentValue', label: t('assets.currentValue') },
    { value: 'profitLossPercentage', label: t('assets.profitLoss') },
    { value: 'name', label: t('createAsset.assetName') },
    { value: 'createdAt', label: t('common.create') },
  ];

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <ErrorMessage error={error} retry={refetch} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('assets.title')}</h1>
          <p className="text-gray-600 mt-1">{t('assets.subtitle')}</p>
        </div>
        <Button
          leftIcon={<AddIcon />}
          onClick={() => navigate('/assets/create')}
        >
          {t('assets.addAsset')}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label={t('assets.assetType')}
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            options={typeOptions}
          />

          <Select
            label={t('assets.sortBy')}
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            options={sortOptions}
          />

          <Select
            label={t('assets.order')}
            value={filters.sortOrder}
            onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}
            options={[
              { value: 'desc', label: t('assets.descending') },
              { value: 'asc', label: t('assets.ascending') },
            ]}
          />
        </div>
      </Card>

      {/* Assets Grid */}
      {isLoading ? (
        <Loading text={t('common.loading')} />
      ) : assets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <AssetCard key={asset._id} asset={asset} />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<TrendingUpIcon />}
            title={t('assets.noAssetsFound')}
            description={t('assets.noAssetsDescription')}
            action={
              <Button
                leftIcon={<AddIcon />}
                onClick={() => navigate('/assets/create')}
              >
                {t('assets.addFirstAsset')}
              </Button>
            }
          />
        </Card>
      )}
    </div>
  );
};
