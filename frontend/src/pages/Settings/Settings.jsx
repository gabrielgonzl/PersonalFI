import { useForm } from 'react-hook-form';
import { useSettings, useUpdateSettings } from '../../hooks/useSettings';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { CURRENCIES, THEMES, LANGUAGES, LANGUAGE_LABELS } from '../../config/constants';
import SaveIcon from '@mui/icons-material/Save';

export const Settings = () => {
  const { showSuccess, showError } = useApp();
  const { data: settings, isLoading, error } = useSettings();
  const updateSettingsMutation = useUpdateSettings();

  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm({
    values: settings?.data || {},
  });

  const onSubmit = async (data) => {
    try {
      await updateSettingsMutation.mutateAsync(data);
      showSuccess('Settings saved successfully');
    } catch (error) {
      showError(error.message || 'Failed to save settings');
    }
  };

  if (isLoading) return <Loading text="Loading settings..." />;
  if (error) return <ErrorMessage error={error} />;

  const currencyOptions = CURRENCIES.map(curr => ({ value: curr, label: curr }));
  const themeOptions = Object.entries({
    light: 'Light',
    dark: 'Dark',
    auto: 'Auto',
  }).map(([value, label]) => ({ value, label }));
  const languageOptions = Object.entries(LANGUAGE_LABELS).map(([value, label]) => ({ value, label }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your application preferences</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General Settings */}
        <Card title="General Settings" subtitle="Basic application configuration">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Default Currency"
              {...register('defaultCurrency')}
              options={currencyOptions}
            />

            <Select
              label="Language"
              {...register('language')}
              options={languageOptions}
            />

            <Select
              label="Theme"
              {...register('theme')}
              options={themeOptions}
            />

            <Select
              label="Default Chart Type"
              {...register('chartType')}
              options={[
                { value: 'line', label: 'Line Chart' },
                { value: 'area', label: 'Area Chart' },
                { value: 'bar', label: 'Bar Chart' },
              ]}
            />
          </div>
        </Card>

        {/* Price Update Settings */}
        <Card title="Price Update Settings" subtitle="Configure automatic price updates">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Update Interval (minutes)"
              {...register('priceUpdateInterval', { valueAsNumber: true })}
              options={[
                { value: '5', label: '5 minutes' },
                { value: '15', label: '15 minutes' },
                { value: '30', label: '30 minutes' },
                { value: '60', label: '1 hour' },
                { value: '120', label: '2 hours' },
                { value: '240', label: '4 hours' },
              ]}
            />

            <Select
              label="Price API Provider"
              {...register('priceApiProvider')}
              options={[
                { value: 'coingecko', label: 'CoinGecko' },
                { value: 'alphavantage', label: 'Alpha Vantage' },
                { value: 'manual', label: 'Manual Only' },
              ]}
            />
          </div>
        </Card>

        {/* Notification Settings */}
        <Card title="Notification Settings" subtitle="Configure alerts and notifications">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Price Alerts</p>
                <p className="text-sm text-gray-600">Get notified when asset prices change significantly</p>
              </div>
              <input
                type="checkbox"
                {...register('notifications.priceAlerts')}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Portfolio Rebalance Alerts</p>
                <p className="text-sm text-gray-600">Get notified when portfolio needs rebalancing</p>
              </div>
              <input
                type="checkbox"
                {...register('notifications.portfolioRebalance')}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            leftIcon={<SaveIcon />}
            loading={updateSettingsMutation.isLoading}
            disabled={!isDirty}
          >
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
