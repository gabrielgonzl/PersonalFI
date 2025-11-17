import { useNavigate } from 'react-router-dom';
import { usePortfolios } from '../../hooks/usePortfolios';
import { useTranslation } from '../../hooks/useTranslation';
import { PortfolioCard } from '../../components/features/PortfolioCard';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { EmptyState } from '../../components/common/EmptyState';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

export const PortfoliosList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = usePortfolios();

  const portfolios = data?.data || [];

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
          <h1 className="text-3xl font-bold text-gray-900">{t('portfolios.title')}</h1>
          <p className="text-gray-600 mt-1">{t('portfolios.subtitle')}</p>
        </div>
        <Button
          leftIcon={<AddIcon />}
          onClick={() => navigate('/portfolios/create')}
        >
          {t('portfolios.createPortfolio')}
        </Button>
      </div>

      {/* Portfolios Grid */}
      {isLoading ? (
        <Loading text={t('common.loading')} />
      ) : portfolios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((portfolio) => (
            <PortfolioCard key={portfolio._id} portfolio={portfolio} />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<AccountBalanceIcon />}
            title={t('portfolios.noPortfoliosFound')}
            description={t('portfolios.noPortfoliosDescription')}
            action={
              <Button
                leftIcon={<AddIcon />}
                onClick={() => navigate('/portfolios/create')}
              >
                {t('portfolios.createFirstPortfolio')}
              </Button>
            }
          />
        </Card>
      )}
    </div>
  );
};
