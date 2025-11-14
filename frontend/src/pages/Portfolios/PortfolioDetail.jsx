import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePortfolio, usePortfolioAllocation, useAddCashToPortfolio, useDeletePortfolio } from '../../hooks/usePortfolios';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Loading } from '../../components/common/Loading';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { AssetCard } from '../../components/features/AssetCard';
import { PieChart } from '../../components/charts/PieChart';
import { formatCurrency, formatPercentage, getProfitLossColor, getProfitLossBgColor, getProfitLossPrefix } from '../../utils/formatters';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export const PortfolioDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currency, showSuccess, showError } = useApp();

  const [showAddCashModal, setShowAddCashModal] = useState(false);
  const [cashAmount, setCashAmount] = useState('');

  const { data: portfolio, isLoading, error } = usePortfolio(id);
  const { data: allocation } = usePortfolioAllocation(id);

  const addCashMutation = useAddCashToPortfolio();
  const deletePortfolioMutation = useDeletePortfolio();

  const assets = portfolio?.data?.assets || [];

  const handleAddCash = async () => {
    try {
      await addCashMutation.mutateAsync({
        id,
        data: { amount: parseFloat(cashAmount) },
      });
      showSuccess('Cash added successfully');
      setShowAddCashModal(false);
      setCashAmount('');
    } catch (error) {
      showError(error.message || 'Failed to add cash');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this portfolio? Assets will not be deleted.')) {
      return;
    }

    try {
      await deletePortfolioMutation.mutateAsync(id);
      showSuccess('Portfolio deleted successfully');
      navigate('/portfolios');
    } catch (error) {
      showError(error.message || 'Failed to delete portfolio');
    }
  };

  if (isLoading) return <Loading text="Loading portfolio..." />;
  if (error) return <ErrorMessage error={error} />;
  if (!portfolio) return <ErrorMessage error={{ message: 'Portfolio not found' }} />;

  const portfolioData = portfolio.data;
  const allocationData = allocation?.data?.allocation || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/portfolios')}>
            <ArrowBackIcon />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{portfolioData.name}</h1>
            {portfolioData.description && (
              <p className="text-gray-600 mt-1">{portfolioData.description}</p>
            )}
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" leftIcon={<AddIcon />} onClick={() => setShowAddCashModal(true)}>
            Add Cash
          </Button>
          <Button variant="outline" leftIcon={<EditIcon />} onClick={() => navigate(`/portfolios/${id}/edit`)}>
            Edit
          </Button>
          <Button variant="danger" leftIcon={<DeleteIcon />} onClick={handleDelete} loading={deletePortfolioMutation.isLoading}>
            Delete
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <p className="text-sm text-gray-600">Total Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(portfolioData.totalValue, portfolioData.currency)}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600">Cash Balance</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(portfolioData.cashBalance, portfolioData.currency)}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600">Total Invested</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(portfolioData.totalInvested, portfolioData.currency)}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600">Profit/Loss</p>
          <p className={`text-2xl font-bold mt-2 ${getProfitLossColor(portfolioData.profitLoss)}`}>
            {getProfitLossPrefix(portfolioData.profitLoss)}
            {formatCurrency(Math.abs(portfolioData.profitLoss), portfolioData.currency)}
          </p>
          <div className={`inline-block px-2 py-1 rounded text-sm mt-2 ${getProfitLossBgColor(portfolioData.profitLoss)}`}>
            {getProfitLossPrefix(portfolioData.profitLoss)}
            {formatPercentage(portfolioData.profitLossPercentage)}
          </div>
        </Card>
      </div>

      {/* Allocation Chart */}
      {allocationData.length > 0 && (
        <Card title="Asset Allocation" subtitle="Distribution by value">
          <PieChart
            data={allocationData.map(item => ({
              name: item.assetName,
              value: item.currentValue,
              color: item.color,
            }))}
            currency={portfolioData.currency}
            height={350}
          />
        </Card>
      )}

      {/* Assets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Assets ({assets.length})
          </h2>
          <Button size="sm" onClick={() => navigate('/assets/create')}>
            Add Asset to Portfolio
          </Button>
        </div>

        {assets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => (
              <AssetCard key={asset._id} asset={asset} />
            ))}
          </div>
        ) : (
          <Card>
            <p className="text-gray-500 text-center py-8">
              No assets in this portfolio yet. Add assets to get started.
            </p>
          </Card>
        )}
      </div>

      {/* Add Cash Modal */}
      <Modal
        isOpen={showAddCashModal}
        onClose={() => setShowAddCashModal(false)}
        title="Add Cash to Portfolio"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Current balance: {formatCurrency(portfolioData.cashBalance, portfolioData.currency)}
          </p>
          <Input
            label="Amount"
            type="number"
            step="any"
            value={cashAmount}
            onChange={(e) => setCashAmount(e.target.value)}
            placeholder="Enter amount to add"
            leftIcon={<AccountBalanceWalletIcon className="w-5 h-5 text-gray-400" />}
          />
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowAddCashModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCash} loading={addCashMutation.isLoading}>
              Add Cash
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
