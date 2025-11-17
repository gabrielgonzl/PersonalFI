/**
 * Datos mock para desarrollo cuando el backend no está disponible
 */

// Mock Assets
export const mockAssets = [
  {
    _id: '1',
    name: 'Bitcoin',
    symbol: 'BTC',
    type: 'crypto',
    currency: 'USD',
    totalInvested: 10000,
    currentValue: 12500,
    quantity: 0.25,
    averagePrice: 40000,
    currentPrice: 50000,
    profitLoss: 2500,
    profitLossPercentage: 25,
    portfolioId: 'p1',
    color: '#F7931A',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-11-14T00:00:00.000Z',
  },
  {
    _id: '2',
    name: 'Ethereum',
    symbol: 'ETH',
    type: 'crypto',
    currency: 'USD',
    totalInvested: 5000,
    currentValue: 5800,
    quantity: 2.5,
    averagePrice: 2000,
    currentPrice: 2320,
    profitLoss: 800,
    profitLossPercentage: 16,
    portfolioId: 'p1',
    color: '#627EEA',
    createdAt: '2024-02-01T00:00:00.000Z',
    updatedAt: '2024-11-14T00:00:00.000Z',
  },
  {
    _id: '3',
    name: 'Apple Inc.',
    symbol: 'AAPL',
    type: 'stock',
    currency: 'USD',
    totalInvested: 8000,
    currentValue: 9200,
    quantity: 50,
    averagePrice: 160,
    currentPrice: 184,
    profitLoss: 1200,
    profitLossPercentage: 15,
    portfolioId: 'p2',
    color: '#555555',
    createdAt: '2024-03-10T00:00:00.000Z',
    updatedAt: '2024-11-14T00:00:00.000Z',
  },
  {
    _id: '4',
    name: 'Vanguard S&P 500 ETF',
    symbol: 'VOO',
    type: 'etf',
    currency: 'USD',
    totalInvested: 15000,
    currentValue: 16500,
    quantity: 35,
    averagePrice: 428.57,
    currentPrice: 471.43,
    profitLoss: 1500,
    profitLossPercentage: 10,
    portfolioId: 'p2',
    color: '#3F51B5',
    createdAt: '2024-01-20T00:00:00.000Z',
    updatedAt: '2024-11-14T00:00:00.000Z',
  },
  {
    _id: '5',
    name: 'Oro',
    symbol: 'GOLD',
    type: 'commodity',
    currency: 'USD',
    totalInvested: 3000,
    currentValue: 2800,
    quantity: 1.5,
    averagePrice: 2000,
    currentPrice: 1866.67,
    profitLoss: -200,
    profitLossPercentage: -6.67,
    portfolioId: null,
    color: '#FFD700',
    createdAt: '2024-04-05T00:00:00.000Z',
    updatedAt: '2024-11-14T00:00:00.000Z',
  },
];

// Mock Portfolios
export const mockPortfolios = [
  {
    _id: 'p1',
    name: 'Cartera Crypto',
    description: 'Inversiones en criptomonedas',
    cashBalance: 1500,
    currency: 'USD',
    totalInvested: 15000,
    currentValue: 18300,
    totalValue: 19800,
    profitLoss: 3300,
    profitLossPercentage: 22,
    color: '#F7931A',
    assetCount: 2,
    assets: mockAssets.filter(a => a.portfolioId === 'p1'),
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-11-14T00:00:00.000Z',
  },
  {
    _id: 'p2',
    name: 'Cartera Tradicional',
    description: 'Acciones y ETFs',
    cashBalance: 2000,
    currency: 'USD',
    totalInvested: 23000,
    currentValue: 25700,
    totalValue: 27700,
    profitLoss: 2700,
    profitLossPercentage: 11.74,
    color: '#3F51B5',
    assetCount: 2,
    assets: mockAssets.filter(a => a.portfolioId === 'p2'),
    createdAt: '2024-01-10T00:00:00.000Z',
    updatedAt: '2024-11-14T00:00:00.000Z',
  },
];

// Mock Analytics Overview
export const mockAnalyticsOverview = {
  totalValue: 50300,
  totalInvested: 41000,
  totalProfitLoss: 9300,
  totalProfitLossPercentage: 22.68,
  assetCount: 5,
  portfolioCount: 2,
  totalValueChange: 3.5, // Cambio en porcentaje último período
};

// Mock Performance Data
export const mockPerformanceData = [
  { date: '2024-10-15', value: 45000, invested: 41000 },
  { date: '2024-10-22', value: 46200, invested: 41000 },
  { date: '2024-10-29', value: 47500, invested: 41000 },
  { date: '2024-11-05', value: 48900, invested: 41000 },
  { date: '2024-11-12', value: 50300, invested: 41000 },
];

// Mock Distribution Data
export const mockDistributionData = {
  byType: [
    { type: 'Criptomoneda', value: 18300, percentage: 36.4 },
    { type: 'Acciones', value: 9200, percentage: 18.3 },
    { type: 'ETF', value: 16500, percentage: 32.8 },
    { type: 'Materias Primas', value: 2800, percentage: 5.6 },
  ],
  byPortfolio: [
    { portfolioName: 'Cartera Crypto', value: 19800, percentage: 39.4, color: '#F7931A' },
    { portfolioName: 'Cartera Tradicional', value: 27700, percentage: 55.1, color: '#3F51B5' },
    { portfolioName: 'Independientes', value: 2800, percentage: 5.6, color: '#9E9E9E' },
  ],
};

// Mock Top Performers
export const mockTopPerformers = [
  ...mockAssets.sort((a, b) => b.profitLossPercentage - a.profitLossPercentage),
];

// Mock Timeline Data
export const mockTimelineData = [
  { date: '2024-01', totalBuy: 12000, totalSell: 0 },
  { date: '2024-02', totalBuy: 5000, totalSell: 0 },
  { date: '2024-03', totalBuy: 8000, totalSell: 0 },
  { date: '2024-04', totalBuy: 3000, totalSell: 500 },
  { date: '2024-05', totalBuy: 4000, totalSell: 0 },
  { date: '2024-06', totalBuy: 0, totalSell: 1000 },
  { date: '2024-07', totalBuy: 3000, totalSell: 0 },
  { date: '2024-08', totalBuy: 2000, totalSell: 500 },
  { date: '2024-09', totalBuy: 1000, totalSell: 0 },
  { date: '2024-10', totalBuy: 3000, totalSell: 0 },
  { date: '2024-11', totalBuy: 0, totalSell: 0 },
];

// Mock Contributions
export const mockContributions = [
  {
    _id: 'c1',
    assetId: '1',
    date: '2024-01-15',
    type: 'buy',
    quantity: 0.25,
    pricePerUnit: 40000,
    totalAmount: 10000,
    fees: 50,
    notes: 'Primera compra de Bitcoin',
  },
  {
    _id: 'c2',
    assetId: '2',
    date: '2024-02-01',
    type: 'buy',
    quantity: 2.5,
    pricePerUnit: 2000,
    totalAmount: 5000,
    fees: 25,
  },
];

// Mock Settings
export const mockSettings = {
  defaultCurrency: 'USD',
  language: 'es',
  theme: 'light',
  chartType: 'line',
  priceUpdateInterval: 60,
  priceApiProvider: 'coingecko',
  notifications: {
    priceAlerts: true,
    portfolioRebalance: true,
    profitLossThreshold: 5,
  },
};
