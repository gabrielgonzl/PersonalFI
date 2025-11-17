import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contributionSchema } from '../../utils/validators';
import { useApp } from '../../context/AppContext';
import { CONTRIBUTION_TYPES, CONTRIBUTION_TYPE_LABELS } from '../../config/constants';
import { Input, Select, Textarea } from '../common/Input';
import { Button } from '../common/Button';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { useState, useEffect } from 'react';

export const ContributionForm = ({
  initialData = null,
  assets = [],
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const { currency } = useApp();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contributionSchema),
    defaultValues: initialData || {
      assetId: '',
      date: formatDate(new Date(), 'yyyy-MM-dd'),
      type: CONTRIBUTION_TYPES.BUY,
      quantity: '',
      pricePerUnit: '',
      totalAmount: '',
      fees: 0,
      notes: '',
      source: '',
    },
  });

  const quantity = watch('quantity');
  const pricePerUnit = watch('pricePerUnit');
  const totalAmount = watch('totalAmount');

  const [calculatedTotal, setCalculatedTotal] = useState(0);

  useEffect(() => {
    if (quantity && pricePerUnit) {
      const total = Number(quantity) * Number(pricePerUnit);
      setCalculatedTotal(total);
      if (!totalAmount) {
        setValue('totalAmount', total);
      }
    }
  }, [quantity, pricePerUnit, totalAmount, setValue]);

  const handleFormSubmit = (data) => {
    if (!data.totalAmount && calculatedTotal) {
      data.totalAmount = calculatedTotal;
    }
    onSubmit(data);
  };

  const contributionTypeOptions = Object.entries(CONTRIBUTION_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const assetOptions = [
    { value: '', label: 'Selecciona un activo' },
    ...assets.map(asset => ({ value: asset._id, label: `${asset.name} (${asset.symbol})` })),
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
        <p className="text-sm text-primary-800">
          Registra aquí tus compras, ventas o transferencias de activos
        </p>
      </div>

      <Select
        label="Activo *"
        {...register('assetId')}
        options={assetOptions}
        error={errors.assetId?.message}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Fecha *"
          type="date"
          {...register('date')}
          error={errors.date?.message}
        />

        <Select
          label="Tipo de Transacción *"
          {...register('type')}
          options={contributionTypeOptions}
          error={errors.type?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Cantidad *"
          type="number"
          step="any"
          placeholder="Ej: 0.5"
          {...register('quantity', { valueAsNumber: true })}
          error={errors.quantity?.message}
          helperText="Número de unidades del activo"
        />

        <Input
          label="Precio por Unidad *"
          type="number"
          step="any"
          placeholder={`Ej: 1000 ${currency}`}
          {...register('pricePerUnit', { valueAsNumber: true })}
          error={errors.pricePerUnit?.message}
          helperText={`Precio en ${currency}`}
        />
      </div>

      <Input
        label="Monto Total *"
        type="number"
        step="any"
        {...register('totalAmount', { valueAsNumber: true })}
        error={errors.totalAmount?.message}
        helperText={calculatedTotal > 0 ? `Calculado: ${formatCurrency(calculatedTotal, currency)}` : ''}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Comisiones"
          type="number"
          step="any"
          placeholder="0.00"
          {...register('fees', { valueAsNumber: true })}
          error={errors.fees?.message}
          helperText="Comisiones de transacción (opcional)"
        />

        <Input
          label="Plataforma/Exchange"
          {...register('source')}
          error={errors.source?.message}
          placeholder="Ej: Binance, eToro..."
          helperText="Nombre de la plataforma (opcional)"
        />
      </div>

      <Textarea
        label="Notas"
        {...register('notes')}
        error={errors.notes?.message}
        placeholder="Información adicional sobre esta transacción..."
        rows={3}
      />

      <div className="flex justify-end space-x-3 pt-5 border-t border-gray-200">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {initialData ? 'Actualizar Aportación' : 'Registrar Aportación'}
        </Button>
      </div>
    </form>
  );
};
