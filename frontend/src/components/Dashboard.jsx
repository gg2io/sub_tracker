import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Plus, Bell, DollarSign, ChevronRight, Settings, Moon, Sun } from 'lucide-react';
import { getDashboardStats, getMonthlySpend, getSubscriptions, getCategories, getPaymentMethods, getSpendingByPaymentMethod } from '../services/api';
import { format } from 'date-fns';
import { useTheme } from '../hooks/useTheme';
import CSVImport from './CSVImport';
import AddSubscriptionModal from './AddSubscriptionModal';
import EditSubscriptionModal from './EditSubscriptionModal';
import NotificationPanel from './NotificationPanel';
import TransactionDetailModal from './TransactionDetailModal';
import CategoryDetailModal from './CategoryDetailModal';
import MonthlySpendingModal from './MonthlySpendingModal';
import SettingsModal from './SettingsModal';
import AllTransactionsModal from './AllTransactionsModal';
import PaymentMethodDetailModal from './PaymentMethodDetailModal';

export default function Dashboard() {
  const { theme, toggleTheme, effectiveTheme } = useTheme();
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMonthlySpending, setShowMonthlySpending] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodSpending, setPaymentMethodSpending] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, monthlyRes, subsRes, catsRes, paymentRes, paymentSpendingRes] = await Promise.all([
        getDashboardStats(),
        getMonthlySpend(12),
        getSubscriptions(true),
        getCategories(),
        getPaymentMethods(),
        getSpendingByPaymentMethod()
      ]);
      setStats(dashboardRes.data);
      setMonthlyData(monthlyRes.data);
      setSubscriptions(subsRes.data);
      setCategories(catsRes.data);
      setPaymentMethods(paymentRes.data);
      setPaymentMethodSpending(paymentSpendingRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdded = () => {
    setShowAddModal(false);
    loadData();
  };

  const handleCategoryClick = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    if (category) {
      setSelectedCategory(category);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-slate-600 dark:text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  // Calculate month-over-month change
  const currentMonthSpend = stats?.monthly_spend || 0;
  const previousMonthSpend = monthlyData.length >= 2 ? monthlyData[monthlyData.length - 2].total : currentMonthSpend;
  const monthlyChange = previousMonthSpend > 0
    ? ((currentMonthSpend - previousMonthSpend) / previousMonthSpend * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Compact Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
                <DollarSign className="text-white" size={20} />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">SubTracker</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title={`Switch to ${effectiveTheme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {effectiveTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Bell size={20} />
                {stats?.notifications_count > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <Button onClick={() => setShowImport(true)} variant="outline" className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Import CSV
              </Button>
              <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
                <Plus size={18} />
                Add Subscription
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* CSV Import Modal */}
        {showImport && (
          <div className="mb-6">
            <CSVImport onSuccess={() => { setShowImport(false); loadData(); }} onCancel={() => setShowImport(false)} />
          </div>
        )}

        {/* My Subscriptions Header */}
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">My Subscriptions</h2>

        {/* Horizontal Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Active Subscriptions */}
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-700 dark:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Active Subscriptions</span>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats?.active_subscriptions || 0}</p>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="text-green-600" size={14} />
                <span className="text-green-600 font-medium">Active now</span>
              </div>
            </CardContent>
          </Card>

          {/* Spend This Month */}
          <Card className="bg-white dark:bg-slate-800 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowMonthlySpending(true)}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-slate-700 dark:text-slate-200" size={20} />
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Spend This Month</span>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                £{currentMonthSpend.toFixed(2)}
              </p>
              <div className="flex items-center gap-1 text-xs">
                {monthlyChange >= 0 ? (
                  <TrendingUp className="text-green-600" size={14} />
                ) : (
                  <TrendingDown className="text-red-600" size={14} />
                )}
                <span className={monthlyChange >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  {monthlyChange >= 0 ? '+' : ''}{monthlyChange.toFixed(0)}% vs last month
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Spend Last Month */}
          <Card className="bg-white dark:bg-slate-800 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowMonthlySpending(true)}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-700 dark:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Spend Last Month</span>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                £{previousMonthSpend.toFixed(2)}
              </p>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Previous period</span>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-white dark:bg-slate-800 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowNotifications(true)}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <Bell className="text-slate-700 dark:text-slate-200" size={20} />
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Notifications</span>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats?.notifications_count || 0}</p>
              <div className="flex items-center gap-1 text-xs">
                <span className={stats?.notifications_count > 0 ? "text-orange-600 font-medium" : "text-slate-500 dark:text-slate-400 font-medium"}>
                  {stats?.notifications_count > 0 ? 'Click to view' : 'All clear'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Subscriptions List */}
        {subscriptions.length > 0 && (
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Active Subscriptions</CardTitle>
              <span className="text-sm text-slate-500 dark:text-slate-400">{subscriptions.length} total</span>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubscription(sub)}
                    className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-slate-900 dark:text-white">{sub.name}</h3>
                      {sub.category && (
                        <span
                          className="text-xs px-2 py-1 rounded-full text-white font-medium"
                          style={{ backgroundColor: sub.category.color }}
                        >
                          {sub.category.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        £{sub.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                        /{sub.billing_cycle}
                      </p>
                    </div>
                    {sub.next_billing_date && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        Next: {format(new Date(sub.next_billing_date), 'MMM dd')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Two-column layout: Recent Activity + Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                Recent Activity
                <button
                  onClick={() => setShowAllTransactions(true)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="View all transactions"
                >
                  <ChevronRight size={20} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.recent_transactions && stats.recent_transactions.length > 0 ? (
                <div className="space-y-2">
                  {stats.recent_transactions.slice(0, 5).map((transaction, index) => (
                    <div
                      key={transaction.id}
                      onClick={() => setSelectedTransaction(transaction)}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-600 transition-colors cursor-pointer border border-slate-100 dark:border-slate-600 hover:border-blue-200 dark:hover:border-blue-500"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`px-3 py-1 rounded-md text-xs font-medium flex-shrink-0 ${
                          index === 0 ? 'bg-blue-100 text-blue-700' :
                          index === 1 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {transaction.merchant || 'Unknown'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{transaction.description}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span>{format(new Date(transaction.date), 'MMM d')}</span>
                            {transaction.payment_method && (
                              <>
                                <span>•</span>
                                <span className="truncate">{transaction.payment_method.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white ml-2 flex-shrink-0">
                        £{Math.abs(transaction.amount).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                  <p>No recent transactions</p>
                  <button
                    onClick={() => setShowImport(true)}
                    className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Import CSV to get started
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Overview Pie Chart */}
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.category_breakdown && stats.category_breakdown.length > 0 ? (
                <div>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={stats.category_breakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="total"
                        nameKey="category_name"
                        animationDuration={800}
                        onClick={(data) => handleCategoryClick(data.category_name)}
                        className="cursor-pointer"
                      >
                        {stats.category_breakdown.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div style={{
                                backgroundColor: 'white',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                fontSize: '12px'
                              }}>
                                <p style={{ margin: 0, fontWeight: 500 }}>
                                  {payload[0].name}: £{payload[0].value.toFixed(2)}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {stats.category_breakdown.map((cat, index) => (
                      <div
                        key={index}
                        onClick={() => handleCategoryClick(cat.category_name)}
                        className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 p-2 rounded-lg transition-colors"
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-200 truncate">
                          {cat.category_name} {cat.percentage.toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                  <p>No category data</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Add subscriptions to see breakdown
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Spending by Payment Method */}
        {paymentMethodSpending.length > 0 && (
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Spending by Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentMethodSpending.map((method, index) => {
                  const total = paymentMethodSpending.reduce((sum, m) => sum + m.total, 0);
                  const percentage = (method.total / total) * 100;

                  return (
                    <div
                      key={method.payment_method_id}
                      className="space-y-2 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      onClick={() => setSelectedPaymentMethod(method)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {method.payment_method_name}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            £{method.total.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {method.transaction_count} transaction{method.transaction_count !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals and Panels */}
      {showAddModal && (
        <AddSubscriptionModal
          categories={categories}
          paymentMethods={paymentMethods}
          onClose={() => setShowAddModal(false)}
          onAdded={handleAdded}
        />
      )}

      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => { setShowNotifications(false); loadData(); }}
      />

      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}

      {selectedCategory && (
        <CategoryDetailModal
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
        />
      )}

      {selectedSubscription && (
        <EditSubscriptionModal
          subscription={selectedSubscription}
          categories={categories}
          paymentMethods={paymentMethods}
          onClose={() => setSelectedSubscription(null)}
          onUpdated={() => { setSelectedSubscription(null); loadData(); }}
        />
      )}

      {showMonthlySpending && (
        <MonthlySpendingModal
          monthlyData={monthlyData}
          onClose={() => setShowMonthlySpending(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          categories={categories}
          paymentMethods={paymentMethods}
          onClose={() => setShowSettings(false)}
          onUpdate={() => { setShowSettings(false); loadData(); }}
        />
      )}

      {showAllTransactions && (
        <AllTransactionsModal
          transactions={stats?.recent_transactions || []}
          onClose={() => setShowAllTransactions(false)}
          onTransactionClick={setSelectedTransaction}
        />
      )}

      {selectedPaymentMethod && (
        <PaymentMethodDetailModal
          paymentMethod={selectedPaymentMethod}
          subscriptions={subscriptions}
          onClose={() => setSelectedPaymentMethod(null)}
          onSubscriptionClick={setSelectedSubscription}
        />
      )}
    </div>
  );
}
