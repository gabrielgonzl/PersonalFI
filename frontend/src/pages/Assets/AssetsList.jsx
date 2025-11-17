import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssets, useDeleteAsset } from '../../hooks/useAssets';
import { useApp } from '../../context/AppContext';
import { AssetCard } from '../../components/features/AssetCard';
import { AssetsTable } from '../../components/features/AssetsTable';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select, Input } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { ASSET_TYPES, ASSET_TYPE_LABELS } from '../../config/constants';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import SearchIcon from '@mui/icons-material/Search';

export const AssetsList = () => {
  const navigate = useNavigate();
  const { currency, showSuccess, showError } = useApp();
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ type: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, asset: null });

  const { data, isLoading, error, refetch } = useAssets(filters);
  const deleteAssetMutation = useDeleteAsset();

  const assets = data?.data || [];
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = searchTerm === '' ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const typeOptions = [
    { value: '', label: 'Todos los tipos' },
    ...Object.entries(ASSET_TYPE_LABELS).map(([value, label]) => ({ value, label })),
  ];

  const handleDelete = async () => {
    if (!deleteModal.asset) return;
    try {
      await deleteAssetMutation.mutateAsync(deleteModal.asset._id);
      showSuccess(`Activo "${deleteModal.asset.name}" eliminado correctamente`);
      setDeleteModal({ isOpen: false, asset: null });
      refetch();
    } catch (error) {
      showError(error.message || 'Error al eliminar el activo');
    }
  };

  if (error) {
    return <div className="max-w-7xl mx-auto"><ErrorMessage error={error} retry={refetch} /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Activos</h1>
          <p className="text-sm text-gray-600 mt-0.5">Gestiona y monitorea todos tus activos de inversión</p>
        </div>
        <Button leftIcon={<AddIcon />} onClick={() => navigate('/assets/create')} className="shadow-md">
          Nuevo Activo
        </Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input placeholder="Buscar por nombre o símbolo..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} leftIcon={<SearchIcon className="text-gray-400" />} />
          </div>
          <Select label="Tipo de Activo" value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })} options={typeOptions} />
          <div className="flex items-end gap-2">
            <div className="flex-1" />
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-white shadow text-primary-600' : 'text-gray-600 hover:text-gray-900'}`}>
                <ViewModuleIcon />
              </button>
              <button onClick={() => setViewMode('table')}
                className={`p-2 rounded transition-colors ${viewMode === 'table' ? 'bg-white shadow text-primary-600' : 'text-gray-600 hover:text-gray-900'}`}>
                <ViewListIcon />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-10"><Loading text="Cargando activos..." /></div>
      ) : filteredAssets.length > 0 ? (
        viewMode === 'table' ? (
          <AssetsTable assets={filteredAssets} onDelete={(asset) => setDeleteModal({ isOpen: true, asset })} currency={currency} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map((asset) => (<AssetCard key={asset._id} asset={asset} />))}
          </div>
        )
      ) : (
        <Card>
          <EmptyState icon={<TrendingUpIcon className="w-14 h-14" />}
            title={searchTerm ? 'No se encontraron activos' : 'Empieza a invertir'}
            description={searchTerm ? 'Intenta con otros términos de búsqueda' : 'Agrega tu primer activo y comienza a rastrear tus inversiones'}
            action={!searchTerm && (
              <Button leftIcon={<AddIcon />} onClick={() => navigate('/assets/create')}>Agregar Primer Activo</Button>
            )} />
        </Card>
      )}

      <Modal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, asset: null })} title="Confirmar Eliminación">
        <div className="space-y-4">
          <p className="text-gray-600">¿Estás seguro de que deseas eliminar el activo <span className="font-bold text-gray-900">"{deleteModal.asset?.name}"</span>?</p>
          <p className="text-sm text-danger-600">Esta acción no se puede deshacer y se eliminarán todas las transacciones asociadas.</p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDeleteModal({ isOpen: false, asset: null })}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete} loading={deleteAssetMutation.isLoading}>Eliminar Activo</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
