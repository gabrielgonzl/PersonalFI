import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAsset, useAssetContributions, useAssetPerformance, useUpdateAssetPrice, useDeleteAsset } from '../../hooks/useAssets';
import { useCreateContribution } from '../../hooks/useContributions';
import { useAssets } from '../../hooks/useAssets';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
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
  const { t } = useTranslation();
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
      showSuccess(t('notifications.priceUpdated'));
      setShowPriceModal(false);
      setNewPrice('');
    } catch (error) {
      showError(error.message || t('notifications.priceUpdateFailed'));
    }
  };

  const handleAddContribution = async (data) => {
    try {
      await createContributionMutation.mutateAsync(data);
      showSuccess(t('notifications.contributionAdded'));
      setShowContributionModal(false);
    } catch (error) {
      showError(error.message || t('notifications.contributionFailed'));
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('confirmations.deleteAsset'))) {
      return;
    }

    try {
      await deleteAssetMutation.mutateAsync(id);
      showSuccess(t('notifications.assetDeleted'));
      navigate('/assets');
    } catch (error) {
      showError(error.message || t('notifications.assetDeleteFailed'));
    }
  };

  if (isLoading) return <Loading text={t('common.loading')} />;
  if (error) return <ErrorMessage error={error} />;
  if (!asset) return <ErrorMessage error={{ message: t('common.errorOccurred') }} />;

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
            {t('assets.updatePrice')}
          </Button>
          <Button variant="outline" leftIcon={<EditIcon />} onClick={() => navigate(`/assets/${id}/edit`)}>
            {t('assets.edit')}
          </Button>
          <Button variant="danger" leftIcon={<DeleteIcon />} onClick={handleDelete} loading={deleteAssetMutation.isLoading}>
            {t('assets.delete')}
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <p className="text-sm text-gray-600">{t('assets.currentValue')}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(asset.data.currentValue, asset.data.currency)}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600">{t('assets.invested')}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(asset.data.totalInvested, asset.data.currency)}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600">{t('assets.profitLoss')}</p>
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
          <p className="text-sm text-gray-600">{t('assets.quantity')}</p>
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
        <Card title={t('assets.performance')} subtitle={t('assets.historicalValue')}>
          <LineChart
            data={performance.data}
            lines={[{ dataKey: 'value', name: t('assets.currentValue'), color: '#0ea5e9' }]}
            currency={asset.data.currency}
            height={300}
          />
        </Card>
      )}

      {/* Contributions */}
      <Card
        title={t('assets.contributions')}
        subtitle={`${contributions.length} ${t('assets.totalTransactions')}`}
        action={
          <Button size="sm" leftIcon={<AddIcon />} onClick={() => setShowContributionModal(true)}>
            {t('assets.addContribution')}
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
          <p className="text-gray-500 text-center py-8">{t('assets.noContributionsYet')}</p>
        )}
      </Card>

      {/* Update Price Modal */}
      <Modal
        isOpen={showPriceModal}
        onClose={() => setShowPriceModal(false)}
        title={t('assets.updatePrice')}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {t('assets.currentPrice')}: {formatCurrency(asset.data.currentPrice, asset.data.currency)}
          </p>
          <Input
            label={t('assets.currentPrice')}
            type="number"
            step="any"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            placeholder={t('assets.currentPrice')}
          />
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowPriceModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleUpdatePrice} loading={updatePriceMutation.isLoading}>
              {t('common.update')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Contribution Modal */}
      <Modal
        isOpen={showContributionModal}
        onClose={() => setShowContributionModal(false)}
        title={t('assets.addContribution')}
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
