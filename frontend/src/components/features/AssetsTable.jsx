import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatPercentage, getProfitLossColor, getProfitLossPrefix, formatDate } from '../../utils/formatters';
import { ASSET_TYPE_LABELS } from '../../config/constants';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export const AssetsTable = ({ assets, onDelete, currency = 'EUR' }) => {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({ key: 'currentValue', direction: 'desc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAssets = [...assets].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;

    if (typeof aValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="text-gray-400 opacity-0 group-hover:opacity-100">⇅</span>;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUpwardIcon className="w-4 h-4" />
    ) : (
      <ArrowDownwardIcon className="w-4 h-4" />
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th
                onClick={() => handleSort('name')}
                className="group px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Activo
                  <SortIcon columnKey="name" />
                </div>
              </th>
              <th
                onClick={() => handleSort('type')}
                className="group px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Tipo
                  <SortIcon columnKey="type" />
                </div>
              </th>
              <th
                onClick={() => handleSort('quantity')}
                className="group px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center justify-end gap-2">
                  Cantidad
                  <SortIcon columnKey="quantity" />
                </div>
              </th>
              <th
                onClick={() => handleSort('currentValue')}
                className="group px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center justify-end gap-2">
                  Valor Actual
                  <SortIcon columnKey="currentValue" />
                </div>
              </th>
              <th
                onClick={() => handleSort('totalInvested')}
                className="group px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center justify-end gap-2">
                  Invertido
                  <SortIcon columnKey="totalInvested" />
                </div>
              </th>
              <th
                onClick={() => handleSort('profitLoss')}
                className="group px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center justify-end gap-2">
                  Ganancia/Pérdida
                  <SortIcon columnKey="profitLoss" />
                </div>
              </th>
              <th
                onClick={() => handleSort('profitLossPercentage')}
                className="group px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center justify-end gap-2">
                  % Cambio
                  <SortIcon columnKey="profitLossPercentage" />
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {sortedAssets.map((asset, index) => (
              <tr
                key={asset._id}
                className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                onClick={() => navigate(`/assets/${asset._id}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md mr-3 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: asset.color || '#0ea5e9' }}
                    >
                      {asset.symbol ? asset.symbol.substring(0, 2).toUpperCase() : asset.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{asset.name}</div>
                      <div className="text-xs text-gray-500">{asset.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                    {ASSET_TYPE_LABELS[asset.type] || asset.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                  {asset.quantity?.toFixed(4) || '0.0000'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                  {formatCurrency(asset.currentValue || 0, currency)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-600">
                  {formatCurrency(asset.totalInvested || 0, currency)}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${getProfitLossColor(asset.profitLoss)}`}>
                  {getProfitLossPrefix(asset.profitLoss)}
                  {formatCurrency(Math.abs(asset.profitLoss || 0), currency)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                    asset.profitLoss >= 0
                      ? 'bg-success-100 text-success-800'
                      : 'bg-danger-100 text-danger-800'
                  }`}>
                    {getProfitLossPrefix(asset.profitLoss)}
                    {formatPercentage(Math.abs(asset.profitLossPercentage || 0))}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => navigate(`/assets/${asset._id}`)}
                      className="text-primary-600 hover:text-primary-900 p-1 hover:bg-primary-100 rounded transition-colors"
                      title="Ver detalles"
                    >
                      <VisibilityIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => navigate(`/assets/${asset._id}/edit`)}
                      className="text-warning-600 hover:text-warning-900 p-1 hover:bg-warning-100 rounded transition-colors"
                      title="Editar"
                    >
                      <EditIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(asset)}
                      className="text-danger-600 hover:text-danger-900 p-1 hover:bg-danger-100 rounded transition-colors"
                      title="Eliminar"
                    >
                      <DeleteIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {assets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No hay activos para mostrar</p>
        </div>
      )}
    </div>
  );
};
