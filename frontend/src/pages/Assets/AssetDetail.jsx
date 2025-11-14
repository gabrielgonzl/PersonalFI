import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAsset, useAssetContributions, useAssetPerformance, useUpdateAssetPrice, useDeleteAsset } from '../../hooks/useAssets';
import { useCreateContribution } from '../../hooks/useContributions';
import { useAssets } from '../../hooks/useAssets';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Loading } from '../../components/common/Loading';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { LineChart } from '../../components/charts/LineChart';
import { ContributionForm } from '../../components/features/ContributionForm';
import { formatCurrency, formatPercentage, formatDate, getProfitLossColor, getProfitLossBgColor, getProfitLossPrefix } from '../../utils/formatters';
import { ASSET_TYPE_LABELS, CONTRIBUTION_TYPE_LABELS } from '../../config/constants';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';

export const AssetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currency, showSuccess, showError } = useApp();

  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [newPrice, setNewPrice] = useState('');

  const { data: asset, isLoading, error } = useAsset(id);
  const { data: contributionsData } = useAssetContributions(id);
  const { data: performance } = useAssetPerformance(id);
  const { data: assetsData } = useAssets();

  const updatePriceMutation = useUpdateAssetPrice();
  const createContributionMutation = useCreateContribution();
  const deleteAssetMutation = useDeleteAsset();

  const contributions = contributionsData?.data || [];
  const allAssets = assetsData?.data || [];

  const handleUpdatePrice = async () => {
    try {
      await updatePriceMutation.mutateAsync({
        id,
        data: { currentPrice: parseFloat(newPrice) },
      });
      showSuccess('Price updated successfully');
      setShowPriceModal(false);
      setNewPrice('');
    } catch (error) {
      showError(error.message || 'Failed to update price');
    }
  };

  const handleAddContribution = async (data) => {
    try {
      await createContributionMutation.mutateAsync(data);
      showSuccess('Contribution added successfully');
      setShowContributionModal(false);
    } catch (error) {
      showError(error.message || 'Failed to add contribution');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this asset? This will also delete all associated contributions.')) {
      return;
    }

    try {
      await deleteAssetMutation.mutateAsync(id);
      showSuccess('Asset deleted successfully');
      navigate('/assets');
    } catch (error) {
      showError(error.message || 'Failed to delete asset');
    }
  };

  if (isLoading) return <Loading text="Loading asset..." />;
  if (error) return <ErrorMessage error={error} />;
  if (!asset) return <ErrorMessage error={{ message: 'Asset not found' }} />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/assets')}>
            <ArrowBackIcon />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{asset.data.name}</h1>
            <p className="text-gray-600 mt-1">
              {asset.data.symbol} • {ASSET_TYPE_LABELS[asset.data.type]}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" leftIcon={<RefreshIcon />} onClick={() => setShowPriceModal(true)}>
            Update Price
          </Button>
          <Button variant="outline" leftIcon={<EditIcon />} onClick={() => navigate(`/assets/${id}/edit`)}>
            Edit
          </Button>
          <Button variant="danger" leftIcon={<DeleteIcon />} onClick={handleDelete} loading={deleteAssetMutation.isLoading}>
            Delete
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <p className="text-sm text-gray-600">Current Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(asset.data.currentValue, asset.data.currency)}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600">Total Invested</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(asset.data.totalInvested, asset.data.currency)}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600">Profit/Loss</p>
          <p className={`text-2xl font-bold mt-2 ${getProfitLossColor(asset.data.profitLoss)}`}>
            {getProfitLossPrefix(asset.data.profitLoss)}
            {formatCurrency(Math.abs(asset.data.profitLoss), asset.data.currency)}
          </p>
          <div className={`inline-block px-2 py-1 rounded text-sm mt-2 ${getProfitLossBgColor(asset.data.profitLoss)}`}>
            {getProfitLossPrefix(asset.data.profitLoss)}
            {formatPercentage(asset.data.profitLossPercentage)}
          </div>
        </Card>

        <Card>
          <p className="text-sm text-gray-600">Quantity</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {asset.data.quantity?.toFixed(4)}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Avg: {formatCurrency(asset.data.averagePrice, asset.data.currency)}
          </p>
        </Card>
      </div>

      {/* Performance Chart */}
      {performance?.data?.length > 0 && (
        <Card title="Performance" subtitle="Historical value over time">
          <LineChart
            data={performance.data}
            lines={[{ dataKey: 'value', name: 'Value', color: '#0ea5e9' }]}
            currency={asset.data.currency}
            height={300}
          />
        </Card>
      )}

      {/* Contributions */}
      <Card
        title="Contributions"
        subtitle={`${contributions.length} total transactions`}
        action={
          <Button size="sm" leftIcon={<AddIcon />} onClick={() => setShowContributionModal(true)}>
            Add Contribution
          </Button>
        }
      >
        {contributions.length > 0 ? (
          <div className="space-y-3">
            {contributions.map((contribution) => (
              <div key={contribution._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">
                    {CONTRIBUTION_TYPE_LABELS[contribution.type]}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(contribution.date)} • {contribution.quantity} units @ {formatCurrency(contribution.pricePerUnit, asset.data.currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(contribution.totalAmount, asset.data.currency)}
                  </p>
                  {contribution.fees > 0 && (
                    <p className="text-sm text-gray-500">
                      Fees: {formatCurrency(contribution.fees, asset.data.currency)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No contributions yet</p>
        )}
      </Card>

      {/* Update Price Modal */}
      <Modal
        isOpen={showPriceModal}
        onClose={() => setShowPriceModal(false)}
        title="Update Asset Price"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Current price: {formatCurrency(asset.data.currentPrice, asset.data.currency)}
          </p>
          <Input
            label="New Price"
            type="number"
            step="any"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            placeholder="Enter new price"
          />
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowPriceModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePrice} loading={updatePriceMutation.isLoading}>
              Update
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Contribution Modal */}
      <Modal
        isOpen={showContributionModal}
        onClose={() => setShowContributionModal(false)}
        title="Add Contribution"
        size="lg"
      >
        <ContributionForm
          assets={allAssets}
          onSubmit={handleAddContribution}
          onCancel={() => setShowContributionModal(false)}
          loading={createContributionMutation.isLoading}
          initialData={{ assetId: id }}
        />
      </Modal>
    </div>
  );
};
