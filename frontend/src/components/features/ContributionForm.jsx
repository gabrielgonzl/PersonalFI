import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contributionSchema } from '../../utils/validators';
import { CONTRIBUTION_TYPES, CONTRIBUTION_TYPE_LABELS } from '../../config/constants';
import { Input, Select, Textarea } from '../common/Input';
import { Button } from '../common/Button';
import { formatDate } from '../../utils/formatters';

export const ContributionForm = ({
  initialData = null,
  assets = [],
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
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

  // Auto-calculate total amount
  const calculatedTotal = quantity && pricePerUnit ? quantity * pricePerUnit : 0;

  const handleFormSubmit = (data) => {
    // Ensure totalAmount is set
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
    { value: '', label: 'Select an asset' },
    ...assets.map(asset => ({ value: asset._id, label: `${asset.name} (${asset.symbol})` })),
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Select
        label="Asset *"
        {...register('assetId')}
        options={assetOptions}
        error={errors.assetId?.message}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Date *"
          type="date"
          {...register('date')}
          error={errors.date?.message}
        />

        <Select
          label="Type *"
          {...register('type')}
          options={contributionTypeOptions}
          error={errors.type?.message}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Quantity *"
          type="number"
          step="any"
          {...register('quantity', { valueAsNumber: true })}
          error={errors.quantity?.message}
        />

        <Input
          label="Price per Unit *"
          type="number"
          step="any"
          {...register('pricePerUnit', { valueAsNumber: true })}
          error={errors.pricePerUnit?.message}
        />
      </div>

      <Input
        label="Total Amount *"
        type="number"
        step="any"
        {...register('totalAmount', { valueAsNumber: true })}
        error={errors.totalAmount?.message}
        helperText={calculatedTotal > 0 ? `Calculated: ${calculatedTotal.toFixed(2)}` : ''}
      />

      <Input
        label="Fees"
        type="number"
        step="any"
        {...register('fees', { valueAsNumber: true })}
        error={errors.fees?.message}
        helperText="Optional transaction fees"
      />

      <Input
        label="Source"
        {...register('source')}
        error={errors.source?.message}
        helperText="Optional: Exchange or platform name"
      />

      <Textarea
        label="Notes"
        {...register('notes')}
        error={errors.notes?.message}
        rows={3}
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initialData ? 'Update Contribution' : 'Add Contribution'}
        </Button>
      </div>
    </form>
  );
};
