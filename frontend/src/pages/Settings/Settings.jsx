import { useForm } from 'react-hook-form';
import { useSettings, useUpdateSettings } from '../../hooks/useSettings';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { CURRENCIES, THEMES, LANGUAGES, LANGUAGE_LABELS } from '../../config/constants';
import SaveIcon from '@mui/icons-material/Save';

export const Settings = () => {
  const { t } = useTranslation();
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
      showSuccess(t('settings.settingsSaved'));
    } catch (error) {
      showError(error.message || t('settings.settingsFailed'));
    }
  };

  if (isLoading) return <Loading text={t('common.loading')} />;
  if (error) return <ErrorMessage error={error} />;

  const currencyOptions = CURRENCIES.map(curr => ({ value: curr, label: curr }));
  const themeOptions = [
    { value: 'light', label: t('themes.light') },
    { value: 'dark', label: t('themes.dark') },
    { value: 'auto', label: t('themes.auto') },
  ];
  const languageOptions = Object.entries(LANGUAGE_LABELS).map(([value, label]) => ({ value, label }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('settings.title')}</h1>
        <p className="text-gray-600 mt-1">{t('settings.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General Settings */}
        <Card title={t('settings.generalSettings')} subtitle={t('settings.basicAppConfig')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label={t('settings.defaultCurrency')}
              {...register('defaultCurrency')}
              options={currencyOptions}
            />

            <Select
              label={t('settings.language')}
              {...register('language')}
              options={languageOptions}
            />

            <Select
              label={t('settings.theme')}
              {...register('theme')}
              options={themeOptions}
            />

            <Select
              label={t('settings.defaultChartType')}
              {...register('chartType')}
              options={[
                { value: 'line', label: t('chartTypes.line') },
                { value: 'area', label: t('chartTypes.area') },
                { value: 'bar', label: t('chartTypes.bar') },
              ]}
            />
          </div>
        </Card>

        {/* Price Update Settings */}
        <Card title={t('settings.priceUpdateSettings')} subtitle={t('settings.automaticPriceUpdates')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label={t('settings.updateInterval')}
              {...register('priceUpdateInterval', { valueAsNumber: true })}
              options={[
                { value: '5', label: t('timeIntervals.5') },
                { value: '15', label: t('timeIntervals.15') },
                { value: '30', label: t('timeIntervals.30') },
                { value: '60', label: t('timeIntervals.60') },
                { value: '120', label: t('timeIntervals.120') },
                { value: '240', label: t('timeIntervals.240') },
              ]}
            />

            <Select
              label={t('settings.priceApiProvider')}
              {...register('priceApiProvider')}
              options={[
                { value: 'coingecko', label: t('apiProviders.coingecko') },
                { value: 'alphavantage', label: t('apiProviders.alphavantage') },
                { value: 'manual', label: t('apiProviders.manual') },
              ]}
            />
          </div>
        </Card>

        {/* Notification Settings */}
        <Card title={t('settings.notificationSettings')} subtitle={t('settings.alertsNotifications')}>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{t('settings.priceAlerts')}</p>
                <p className="text-sm text-gray-600">{t('settings.priceAlertsDesc')}</p>
              </div>
              <input
                type="checkbox"
                {...register('notifications.priceAlerts')}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{t('settings.portfolioRebalanceAlerts')}</p>
                <p className="text-sm text-gray-600">{t('settings.portfolioRebalanceDesc')}</p>
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
            {t('settings.saveSettings')}
          </Button>
        </div>
      </form>
    </div>
  );
};
