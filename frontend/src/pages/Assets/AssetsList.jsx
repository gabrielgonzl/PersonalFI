import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssets } from '../../hooks/useAssets';
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
  const [filters, setFilters] = useState({
    type: '',
    portfolioId: '',
    sortBy: 'currentValue',
    sortOrder: 'desc',
  });

  const { data, isLoading, error, refetch } = useAssets(filters);

  const assets = data?.data || [];

  const typeOptions = [
    { value: '', label: 'All Types' },
    ...Object.entries(ASSET_TYPE_LABELS).map(([value, label]) => ({ value, label })),
  ];

  const sortOptions = [
    { value: 'currentValue', label: 'Current Value' },
    { value: 'profitLossPercentage', label: 'Profit/Loss %' },
    { value: 'name', label: 'Name' },
    { value: 'createdAt', label: 'Date Created' },
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
          <h1 className="text-3xl font-bold text-gray-900">Assets</h1>
          <p className="text-gray-600 mt-1">Manage your investment assets</p>
        </div>
        <Button
          leftIcon={<AddIcon />}
          onClick={() => navigate('/assets/create')}
        >
          Add Asset
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Asset Type"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            options={typeOptions}
          />

          <Select
            label="Sort By"
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            options={sortOptions}
          />

          <Select
            label="Order"
            value={filters.sortOrder}
            onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}
            options={[
              { value: 'desc', label: 'Descending' },
              { value: 'asc', label: 'Ascending' },
            ]}
          />
        </div>
      </Card>

      {/* Assets Grid */}
      {isLoading ? (
        <Loading text="Loading assets..." />
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
            title="No assets found"
            description="Start building your portfolio by adding your first asset"
            action={
              <Button
                leftIcon={<AddIcon />}
                onClick={() => navigate('/assets/create')}
              >
                Add Your First Asset
              </Button>
            }
          />
        </Card>
      )}
    </div>
  );
};
