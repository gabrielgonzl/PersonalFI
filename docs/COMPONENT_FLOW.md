# 🗺️ Growing - Component Flow & Navigation

## Documentación de Flujo de Componentes y Navegación

---

## 📋 Tabla de Contenidos

1. [Mapa de Navegación](#mapa-de-navegación)
2. [Jerarquía de Componentes](#jerarquía-de-componentes)
3. [Flujos de Usuario](#flujos-de-usuario)
4. [State Management](#state-management)
5. [Data Flow Patterns](#data-flow-patterns)

---

## 🗺️ Mapa de Navegación

```
┌─────────────────────────────────────────────────────────────┐
│                    GROWING APP NAVIGATION                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Header                                                      │
│  [Logo]  Dashboard | Assets | Portfolios | Analytics        │
│                                            [Settings] [User] │
└─────────────────────────────────────────────────────────────┘

ROUTE: /
┌─────────────────────────────────────────────────────────────┐
│  📊 Dashboard                                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Stats Grid                                              │ │
│  │ [Total Value] [P&L] [ROI %] [Assets Count]            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  Portfolio Pie Chart │  │  Performance Line    │        │
│  │                       │  │  Chart               │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                              │
│  📁 Portfolios Overview                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [Cartera Crypto] $23,500 | +$3,500 (23.33%)           │ │
│  │ [View] [Add Cash] [Distribute]                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  🔗 Quick Actions                                           │
│  [➕ New Asset] [💰 Add Contribution] [📁 New Portfolio]   │
└─────────────────────────────────────────────────────────────┘

ROUTE: /assets
┌─────────────────────────────────────────────────────────────┐
│  📦 Assets Management                                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Filters: [All Types ▼] [All Portfolios ▼]             │ │
│  │ Sort: [Current Value ▼] [➕ Create Asset]              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Assets Table                                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Name      Type    Value    P&L     ROI%    Actions    │ │
│  │ Bitcoin   Crypto  $11,250  +$1,250  12.5%  [👁️][✏️][🗑️]│ │
│  │ Ethereum  Crypto  $7,250   +$2,250  45.0%  [👁️][✏️][🗑️]│ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Load More...]                                              │
└─────────────────────────────────────────────────────────────┘
                     │
                     │ Click Asset Name / 👁️
                     ▼
ROUTE: /assets/:id
┌─────────────────────────────────────────────────────────────┐
│  📦 Bitcoin (BTC) Detail                          [✏️ Edit]  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Asset Info                                              │ │
│  │ Type: Crypto | Portfolio: Cartera Crypto               │ │
│  │ Current Price: $45,000.00 [🔄 Update Price]            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  Metrics             │  │  Allocation in       │        │
│  │  Total Invested:     │  │  Portfolio           │        │
│  │  $10,000.00          │  │  [Pie Chart]         │        │
│  │  Current Value:      │  │                       │        │
│  │  $11,250.00          │  │  Bitcoin: 47.87%     │        │
│  │  Quantity: 0.25 BTC  │  │                       │        │
│  │  Avg Price: $40,000  │  │                       │        │
│  │  P&L: +$1,250 (12.5%)│  │                       │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                              │
│  💰 Contributions History       [➕ Add Contribution]       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Date       Type  Qty     Price    Total     Actions    │ │
│  │ 2024-01-15 Buy   0.1 BTC $40,000  $4,020   [✏️][🗑️]   │ │
│  │ 2024-01-10 Buy   0.15BTC $39,500  $5,925   [✏️][🗑️]   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  📊 Performance Chart (Historical Value)                    │
│  [Line Chart showing value over time]                       │
└─────────────────────────────────────────────────────────────┘

ROUTE: /assets/create
┌─────────────────────────────────────────────────────────────┐
│  ➕ Create New Asset                                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Name: [_________________]                              │ │
│  │  Symbol: [______]                                       │ │
│  │  Type: [Crypto ▼]                                       │ │
│  │  Currency: [USD ▼]                                      │ │
│  │  Current Price: [_______]                               │ │
│  │  Portfolio: [None ▼] (optional)                         │ │
│  │  Color: [🎨 #F7931A]                                    │ │
│  │  Notes: [________________________]                      │ │
│  │                                                          │ │
│  │  [Cancel] [Create Asset]                                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

ROUTE: /portfolios
┌─────────────────────────────────────────────────────────────┐
│  📁 Portfolios Management                 [➕ New Portfolio] │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  📁 Cartera Crypto                               Active │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │ Total Value: $23,500.00                          │  │ │
│  │  │ Invested: $15,000.00 | Cash: $5,000.00          │  │ │
│  │  │ P&L: +$3,500.00 (23.33%)                         │  │ │
│  │  │                                                   │  │ │
│  │  │ [View Details] [Add Cash] [Distribute Cash]      │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                                                          │ │
│  │  Assets (4):                                             │ │
│  │  • Bitcoin: $11,250 (47.87%)                            │ │
│  │  • Ethereum: $7,250 (30.85%)                            │ │
│  │  • Cardano: $3,000 (12.77%)                             │ │
│  │  • Solana: $2,000 (8.51%)                               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  📁 Cartera Tech Stocks                         Active  │ │
│  │  [Similar structure...]                                 │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                     │
                     │ Click "View Details"
                     ▼
ROUTE: /portfolios/:id
┌─────────────────────────────────────────────────────────────┐
│  📁 Cartera Crypto                     [✏️ Edit] [🗑️ Delete]│
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Description: Criptomonedas de largo plazo             │ │
│  │  Currency: USD | Status: Active                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  💰 Financial Overview                                      │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  Cash Balance        │  │  Invested Assets     │        │
│  │  $5,000.00           │  │  $18,500.00          │        │
│  │                       │  │                       │        │
│  │  [💰 Add Cash]       │  │  Invested: $15,000   │        │
│  │  [📤 Distribute]     │  │  P&L: +$3,500 (23%)  │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                              │
│  📊 Allocation Chart                                        │
│  [Pie Chart showing asset distribution]                     │
│                                                              │
│  🔗 Assets in Portfolio                    [➕ Add Asset]   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Name      Value    Allocation  P&L       Actions       │ │
│  │ Bitcoin   $11,250  47.87%      +$1,250   [View][Remove]│ │
│  │ Ethereum  $7,250   30.85%      +$2,250   [View][Remove]│ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  🎯 Target Allocation (Optional)        [⚙️ Configure]      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Bitcoin:   Target 50% | Current 47.87% | Diff -2.13%  │ │
│  │ Ethereum:  Target 30% | Current 30.85% | Diff +0.85%  │ │
│  │ [🔄 Rebalance Portfolio]                               │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

ROUTE: /analytics
┌─────────────────────────────────────────────────────────────┐
│  📊 Analytics & Reports                                      │
│                                                              │
│  Period: [Last 3 Months ▼]  Granularity: [Daily ▼]        │
│                                                              │
│  📈 Performance Overview                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  [Line Chart: Portfolio Value Over Time]               │ │
│  │  - Total Invested (line)                                │ │
│  │  - Current Value (line)                                 │ │
│  │  - Profit/Loss Area (shaded)                            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  📊 Distribution Analysis                                   │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  By Asset Type       │  │  By Portfolio        │        │
│  │  [Pie Chart]         │  │  [Pie Chart]         │        │
│  │  Crypto: 55.56%      │  │  Cartera Crypto: 52% │        │
│  │  Stocks: 28.89%      │  │  Tech Stocks: 29%    │        │
│  │  ETFs: 15.56%        │  │  Independent: 19%    │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                              │
│  🏆 Top Performers                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  1. Bitcoin       +25.5%  ($2,550)                     │ │
│  │  2. Ethereum      +18.3%  ($1,250)                     │ │
│  │  3. Apple Stock   +15.2%  ($750)                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  📉 Worst Performers                                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  1. Some Stock    -5.2%   (-$250)                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  📅 Investment Timeline                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  [Timeline visualization of all events]                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

ROUTE: /settings
┌─────────────────────────────────────────────────────────────┐
│  ⚙️ Settings                                                 │
│                                                              │
│  🎨 Appearance                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Theme: ◉ Light  ◯ Dark  ◯ Auto                        │ │
│  │  Language: [Spanish ▼]                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  💰 Financial                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Default Currency: [USD ▼]                              │ │
│  │  Chart Type: [Line ▼]                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  🔄 Price Updates (Future Feature)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Update Interval: [15] minutes                          │ │
│  │  API Provider: [Manual ▼]                               │ │
│  │  API Keys: [Configure...]                               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  🔔 Notifications (Future Feature)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ☐ Price Alerts                                         │ │
│  │  ☐ Portfolio Rebalance Reminders                        │ │
│  │  P&L Threshold: [10]%                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Save Settings]                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Jerarquía de Componentes

### Aplicación Completa

```
<App>
├── <Router>
│   └── <MainLayout>
│       ├── <Header>
│       │   ├── <Logo>
│       │   ├── <Navigation>
│       │   │   ├── <NavLink to="/">Dashboard</NavLink>
│       │   │   ├── <NavLink to="/assets">Assets</NavLink>
│       │   │   ├── <NavLink to="/portfolios">Portfolios</NavLink>
│       │   │   └── <NavLink to="/analytics">Analytics</NavLink>
│       │   └── <HeaderActions>
│       │       └── <SettingsButton>
│       │
│       ├── <Sidebar> (opcional en mobile)
│       │   ├── <PortfolioQuickSelector>
│       │   └── <QuickActions>
│       │
│       └── <main>
│           └── <Routes>
│               ├── Route path="/" → <DashboardPage>
│               ├── Route path="/assets" → <AssetsListPage>
│               ├── Route path="/assets/create" → <CreateAssetPage>
│               ├── Route path="/assets/:id" → <AssetDetailPage>
│               ├── Route path="/portfolios" → <PortfoliosListPage>
│               ├── Route path="/portfolios/:id" → <PortfolioDetailPage>
│               ├── Route path="/analytics" → <AnalyticsPage>
│               └── Route path="/settings" → <SettingsPage>
└── <AppProviders>
    ├── <QueryClientProvider>
    ├── <ThemeProvider>
    └── <AppContext.Provider>
```

---

### Dashboard Page

```
<DashboardPage>
├── <PageHeader title="Dashboard">
│
├── <StatsGrid>
│   ├── <StatCard
│   │     title="Total Value"
│   │     value={totalValue}
│   │     icon={<DollarIcon>}
│   │     trend="+5.2%"
│   │   />
│   ├── <StatCard title="Profit/Loss" />
│   ├── <StatCard title="ROI %" />
│   └── <StatCard title="Assets Count" />
│
├── <ChartsSection>
│   ├── <Card>
│   │   └── <PortfolioPieChart
│   │         data={allocationData}
│   │         onSegmentClick={handleSegmentClick}
│   │       />
│   │
│   └── <Card>
│       └── <PerformanceLineChart
│             data={performanceData}
│             period="3m"
│           />
│
├── <PortfoliosOverview>
│   ├── <SectionHeader
│   │     title="My Portfolios"
│   │     action={<Button>+ New Portfolio</Button>}
│   │   />
│   │
│   └── portfolios.map(p =>
│       <PortfolioCard
│         key={p.id}
│         portfolio={p}
│         onAddCash={handleAddCash}
│         onDistribute={handleDistributeCash}
│         onClick={navigateToPortfolio}
│       />
│     )
│
├── <QuickActions>
│   ├── <Button onClick={createAsset}>+ New Asset</Button>
│   ├── <Button onClick={addContribution}>💰 Add Contribution</Button>
│   └── <Button onClick={createPortfolio}>📁 New Portfolio</Button>
│
└── <RecentActivity>
    └── activities.map(a => <ActivityItem key={a.id} {...a} />)
```

---

### Asset Detail Page

```
<AssetDetailPage>
├── <PageHeader>
│   ├── <Breadcrumb>
│   │   └── Home > Assets > Bitcoin
│   ├── <Title>{asset.name} ({asset.symbol})</Title>
│   └── <Actions>
│       ├── <Button onClick={handleEdit}>Edit</Button>
│       └── <Button onClick={handleDelete} variant="danger">Delete</Button>
│
├── <AssetInfoCard>
│   ├── <InfoRow label="Type" value={asset.type} />
│   ├── <InfoRow label="Portfolio" value={portfolio?.name} />
│   ├── <InfoRow label="Currency" value={asset.currency} />
│   └── <PriceUpdateSection>
│       └── <UpdatePriceForm onSubmit={handlePriceUpdate} />
│
├── <MetricsGrid>
│   ├── <MetricCard title="Total Invested" value={asset.totalInvested} />
│   ├── <MetricCard title="Current Value" value={asset.currentValue} />
│   ├── <MetricCard title="Quantity" value={asset.quantity} />
│   ├── <MetricCard title="Avg Price" value={asset.averagePrice} />
│   ├── <MetricCard
│   │     title="Profit/Loss"
│   │     value={asset.profitLoss}
│   │     trend={asset.profitLossPercentage}
│   │     color={asset.profitLoss >= 0 ? 'green' : 'red'}
│   │   />
│   └── <Card>
│       └── <AllocationPieChart />
│
├── <ContributionsSection>
│   ├── <SectionHeader
│   │     title="Contributions History"
│   │     action={<Button onClick={openContributionModal}>+ Add</Button>}
│   │   />
│   │
│   └── <ContributionsTable>
│       ├── <TableHeader>
│       │   └── [Date, Type, Qty, Price, Total, Actions]
│       │
│       └── contributions.map(c =>
│           <ContributionRow
│             key={c.id}
│             contribution={c}
│             onEdit={handleEdit}
│             onDelete={handleDelete}
│           />
│         )
│
├── <PerformanceChart>
│   └── <LineChart
│         data={performanceTimeline}
│         xAxis="date"
│         yAxis="value"
│       />
│
└── <Modals>
    ├── <ContributionModal
    │     isOpen={isContributionModalOpen}
    │     onClose={closeContributionModal}
    │     onSubmit={handleAddContribution}
    │   />
    └── <ConfirmDeleteModal />
```

---

### Portfolio Detail Page

```
<PortfolioDetailPage>
├── <PageHeader>
│   ├── <Title>{portfolio.name}</Title>
│   ├── <Badge color={portfolio.color}>Active</Badge>
│   └── <Actions>
│       ├── <Button onClick={handleEdit}>Edit</Button>
│       └── <Button onClick={handleDelete}>Delete</Button>
│
├── <PortfolioInfoCard>
│   └── <Description>{portfolio.description}</Description>
│
├── <FinancialOverviewGrid>
│   ├── <CashBalanceCard>
│   │   ├── <Value>{portfolio.cashBalance}</Value>
│   │   └── <Actions>
│   │       ├── <Button onClick={openAddCashModal}>💰 Add Cash</Button>
│   │       └── <Button onClick={openDistributeModal}>📤 Distribute</Button>
│   │
│   └── <InvestedAssetsCard>
│       ├── <Metric label="Current Value" value={portfolio.currentValue} />
│       ├── <Metric label="Invested" value={portfolio.totalInvested} />
│       └── <Metric
│             label="P&L"
│             value={portfolio.profitLoss}
│             trend={portfolio.profitLossPercentage}
│           />
│
├── <AllocationSection>
│   └── <AllocationPieChart
│         data={allocationData}
│         includesCash={true}
│       />
│
├── <AssetsInPortfolio>
│   ├── <SectionHeader
│   │     title="Assets"
│   │     action={<Button onClick={openAddAssetModal}>+ Add Asset</Button>}
│   │   />
│   │
│   └── <AssetsTable>
│       └── assets.map(a =>
│           <AssetRow
│             key={a.id}
│             asset={a}
│             onView={navigateToAsset}
│             onRemove={handleRemoveFromPortfolio}
│           />
│         )
│
├── <TargetAllocationSection>
│   ├── <SectionHeader
│   │     title="Target Allocation"
│   │     action={<Button onClick={openConfigModal}>⚙️ Configure</Button>}
│   │   />
│   │
│   ├── targetAllocation.map(t =>
│   │   <AllocationRow
│   │     key={t.assetId}
│   │     asset={t.asset}
│   │     target={t.percentage}
│   │     current={t.currentPercentage}
│   │     difference={t.difference}
│   │   />
│   │ )
│   │
│   └── <Button
│         onClick={handleRebalance}
│         disabled={!canRebalance}
│       >
│         🔄 Rebalance Portfolio
│       </Button>
│
└── <Modals>
    ├── <AddCashModal />
    ├── <DistributeCashModal>
    │   └── <DistributionForm>
    │       └── assets.map(a =>
    │           <DistributionInput
    │             asset={a}
    │             maxAmount={availableCash}
    │           />
    │         )
    ├── <ConfigureTargetAllocationModal />
    └── <RebalanceConfirmationModal />
```

---

## 👤 Flujos de Usuario

### 1. Crear Asset y Primera Aportación

```
Usuario                    Frontend                Backend              Database
   │                          │                       │                    │
   │──[1. Click "New Asset"]─>│                       │                    │
   │                          │                       │                    │
   │<──[2. Render Form]───────│                       │                    │
   │                          │                       │                    │
   │──[3. Submit Form]───────>│                       │                    │
   │                          │                       │                    │
   │                          │──[4. POST /assets]──>│                    │
   │                          │                       │                    │
   │                          │                       │──[5. Create]─────>│
   │                          │                       │                    │
   │                          │                       │<─[6. Asset Doc]───│
   │                          │                       │                    │
   │                          │<─[7. Response]───────│                    │
   │                          │                       │                    │
   │<──[8. Navigate to        │                       │                    │
   │     Asset Detail]────────│                       │                    │
   │                          │                       │                    │
   │──[9. Click "Add          │                       │                    │
   │     Contribution"]───────>│                       │                    │
   │                          │                       │                    │
   │<──[10. Render Modal]─────│                       │                    │
   │                          │                       │                    │
   │──[11. Submit]───────────>│                       │                    │
   │                          │                       │                    │
   │                          │─[12. POST            │                    │
   │                          │  /contributions]────>│                    │
   │                          │                       │                    │
   │                          │                       │─[13. Create       │
   │                          │                       │  Contribution]──>│
   │                          │                       │                    │
   │                          │                       │─[14. Update       │
   │                          │                       │  Asset metrics]─>│
   │                          │                       │                    │
   │                          │                       │<─[15. Updated]────│
   │                          │                       │                    │
   │                          │<─[16. Response]──────│                    │
   │                          │                       │                    │
   │<──[17. Update UI         │                       │                    │
   │     - Asset metrics      │                       │                    │
   │     - Contribution list]─│                       │                    │
```

---

### 2. Distribuir Efectivo en Portfolio

```
Usuario                    Frontend                Backend              Database
   │                          │                       │                    │
   │──[1. Navigate to         │                       │                    │
   │     Portfolio Detail]───>│                       │                    │
   │                          │                       │                    │
   │                          │─[2. GET               │                    │
   │                          │  /portfolios/:id]───>│                    │
   │                          │                       │                    │
   │                          │                       │─[3. Fetch         │
   │                          │                       │  Portfolio +      │
   │                          │                       │  Assets]────────>│
   │                          │                       │                    │
   │                          │                       │<─[4. Data]────────│
   │                          │                       │                    │
   │                          │<─[5. Response]───────│                    │
   │                          │                       │                    │
   │<──[6. Render Page]───────│                       │                    │
   │    Cash: $5,000          │                       │                    │
   │    4 Assets              │                       │                    │
   │                          │                       │                    │
   │──[7. Click               │                       │                    │
   │     "Distribute Cash"]──>│                       │                    │
   │                          │                       │                    │
   │<──[8. Open Modal with    │                       │                    │
   │     Asset List]──────────│                       │                    │
   │                          │                       │                    │
   │──[9. Fill Distribution:  │                       │                    │
   │     BTC: $2000           │                       │                    │
   │     ETH: $1500           │                       │                    │
   │     SOL: $500]───────────>│                      │                    │
   │                          │                       │                    │
   │                          │─[Validate: Total      │                    │
   │                          │  = $4000 ≤ $5000 ✓]  │                    │
   │                          │                       │                    │
   │──[10. Submit]───────────>│                       │                    │
   │                          │                       │                    │
   │                          │─[11. POST             │                    │
   │                          │  /portfolios/:id/     │                    │
   │                          │  distribute-cash]───>│                    │
   │                          │                       │                    │
   │                          │                       │─[12. Start        │
   │                          │                       │  Transaction]───>│
   │                          │                       │                    │
   │                          │                       │─[13. Create 3     │
   │                          │                       │  Contributions]─>│
   │                          │                       │                    │
   │                          │                       │─[14. Update 3     │
   │                          │                       │  Assets]────────>│
   │                          │                       │                    │
   │                          │                       │─[15. Update       │
   │                          │                       │  Portfolio        │
   │                          │                       │  cashBalance]───>│
   │                          │                       │                    │
   │                          │                       │<─[16. Success]────│
   │                          │                       │                    │
   │                          │<─[17. Response with   │                    │
   │                          │   updated data]──────│                    │
   │                          │                       │                    │
   │─[18. Invalidate queries  │                       │                    │
   │  for portfolio & assets] │                       │                    │
   │                          │                       │                    │
   │<──[19. Refetch & Update  │                       │                    │
   │     UI - New balances    │                       │                    │
   │     - Updated metrics]───│                       │                    │
```

---

### 3. Actualizar Dashboard al Abrir App

```
Usuario                    React Query             Backend              Database
   │                          │                       │                    │
   │──[1. Open App /]────────>│                       │                    │
   │                          │                       │                    │
   │                          │─[2. Check cache for   │                    │
   │                          │  'analytics-overview']│                    │
   │                          │  → STALE or MISSING   │                    │
   │                          │                       │                    │
   │                          │─[3. Execute           │                    │
   │                          │  parallel queries:    │                    │
   │                          │                       │                    │
   │                          │──[GET /analytics/     │                    │
   │                          │   overview]─────────>│                    │
   │                          │                       │                    │
   │                          │──[GET /portfolios]──>│                    │
   │                          │                       │                    │
   │                          │──[GET /assets]──────>│                    │
   │                          │                       │                    │
   │                          │                       │─[4. Aggregate     │
   │                          │                       │  calculations]──>│
   │                          │                       │                    │
   │                          │                       │<─[5. Results]─────│
   │                          │                       │                    │
   │                          │<─[6. Response 1]─────│                    │
   │                          │                       │                    │
   │                          │<─[7. Response 2]─────│                    │
   │                          │                       │                    │
   │                          │<─[8. Response 3]─────│                    │
   │                          │                       │                    │
   │                          │─[9. Update cache with │                    │
   │                          │  fresh data]          │                    │
   │                          │                       │                    │
   │<──[10. Render Dashboard  │                       │                    │
   │     with data:           │                       │                    │
   │     - Stats cards        │                       │                    │
   │     - Charts             │                       │                    │
   │     - Portfolio cards]───│                       │                    │
   │                          │                       │                    │
   │    [Subsequent visits    │                       │                    │
   │     within staleTime     │                       │                    │
   │     use cached data]     │                       │                    │
```

---

## 🔄 State Management

### React Query Configuration

```javascript
// React Query keys structure
const queryKeys = {
  // Assets
  assets: ['assets'],
  assetDetail: (id) => ['assets', id],
  assetContributions: (id) => ['assets', id, 'contributions'],
  assetPerformance: (id, period) => ['assets', id, 'performance', period],

  // Portfolios
  portfolios: ['portfolios'],
  portfolioDetail: (id) => ['portfolios', id],
  portfolioAllocation: (id) => ['portfolios', id, 'allocation'],

  // Analytics
  analyticsOverview: ['analytics', 'overview'],
  analyticsPerformance: (period) => ['analytics', 'performance', period],
  analyticsDistribution: ['analytics', 'distribution'],

  // Settings
  settings: ['settings']
};

// Cache configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: true,
      retry: 1
    }
  }
});
```

---

### Context API (Global State)

```javascript
// AppContext structure
const AppContext = {
  // User preferences (from Settings)
  settings: {
    defaultCurrency: 'USD',
    theme: 'dark',
    language: 'es'
  },

  // UI state
  ui: {
    sidebarOpen: true,
    activePortfolioFilter: null
  },

  // Actions
  updateSettings: (newSettings) => {},
  toggleSidebar: () => {},
  setActivePortfolioFilter: (portfolioId) => {}
};
```

---

## 📊 Data Flow Patterns

### Pattern 1: Optimistic Updates

```javascript
// Ejemplo: Agregar contribución con optimistic update
const addContribution = useMutation({
  mutationFn: (newContribution) =>
    api.post('/contributions', newContribution),

  // Optimistic update
  onMutate: async (newContribution) => {
    // Cancelar queries en progreso
    await queryClient.cancelQueries(['assets', assetId]);

    // Snapshot del valor anterior
    const previousAsset = queryClient.getQueryData(['assets', assetId]);

    // Actualizar cache optimísticamente
    queryClient.setQueryData(['assets', assetId], (old) => ({
      ...old,
      quantity: old.quantity + newContribution.quantity,
      totalInvested: old.totalInvested + newContribution.totalAmount
    }));

    return { previousAsset };
  },

  // Si falla, revertir
  onError: (err, newContribution, context) => {
    queryClient.setQueryData(
      ['assets', assetId],
      context.previousAsset
    );
  },

  // Siempre refetch al completar
  onSettled: () => {
    queryClient.invalidateQueries(['assets', assetId]);
    queryClient.invalidateQueries(['assets', assetId, 'contributions']);
  }
});
```

---

### Pattern 2: Invalidación en Cascada

```javascript
// Cuando se elimina un asset, invalidar múltiples queries
const deleteAsset = useMutation({
  mutationFn: (assetId) => api.delete(`/assets/${assetId}`),

  onSuccess: (data, deletedAssetId) => {
    // Invalidar lista de assets
    queryClient.invalidateQueries(['assets']);

    // Invalidar el portfolio relacionado (si existe)
    const asset = queryClient.getQueryData(['assets', deletedAssetId]);
    if (asset?.portfolioId) {
      queryClient.invalidateQueries(['portfolios', asset.portfolioId]);
      queryClient.invalidateQueries(['portfolios']);
    }

    // Invalidar analytics
    queryClient.invalidateQueries(['analytics']);
  }
});
```

---

### Pattern 3: Parallel Data Fetching

```javascript
// Dashboard: fetch múltiple data en paralelo
const DashboardPage = () => {
  const { data: overview } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => api.get('/analytics/overview')
  });

  const { data: portfolios } = useQuery({
    queryKey: ['portfolios'],
    queryFn: () => api.get('/portfolios')
  });

  const { data: performance } = useQuery({
    queryKey: ['analytics', 'performance', '3m'],
    queryFn: () => api.get('/analytics/performance?period=3m')
  });

  // React Query ejecuta las 3 en paralelo automáticamente
  // Renderiza con estados de loading independientes
};
```

---

## 🎨 Responsive Behavior

### Breakpoints

```css
/* Mobile First Approach */
--breakpoint-sm: 640px;   /* Small devices (phones) */
--breakpoint-md: 768px;   /* Medium devices (tablets) */
--breakpoint-lg: 1024px;  /* Large devices (desktops) */
--breakpoint-xl: 1280px;  /* Extra large devices */
```

### Component Adaptations

| Component | Mobile (<768px) | Tablet (768-1024px) | Desktop (>1024px) |
|-----------|-----------------|---------------------|-------------------|
| Header | Hamburger menu | Full nav | Full nav + actions |
| Sidebar | Hidden (drawer) | Collapsible | Always visible |
| Stats Grid | 1 column | 2 columns | 4 columns |
| Charts | Stacked vertically | 2 columns | Side by side |
| Tables | Card view | Scrollable table | Full table |
| Modals | Full screen | Centered (80%) | Centered (60%) |

---

**Última actualización**: 2025-11-14
