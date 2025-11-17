import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MonthlySpendingModal({ monthlyData, onClose }) {
  if (!monthlyData || monthlyData.length < 2) return null;

  // Get last two months of data
  const lastTwoMonths = monthlyData.slice(-2);
  const currentMonth = lastTwoMonths[1];
  const previousMonth = lastTwoMonths[0];

  // Calculate change
  const change = currentMonth.total - previousMonth.total;
  const changePercent = previousMonth.total > 0
    ? ((change / previousMonth.total) * 100)
    : 0;

  // Prepare data for bar chart (last 6 months)
  const chartData = monthlyData.slice(-6).map(month => ({
    month: month.month,
    spending: month.total
  }));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="max-w-4xl w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-700">
            <CardTitle className="flex items-center gap-2">
              <div className="gradient-primary p-2 rounded-lg">
                {change >= 0 ? (
                  <TrendingUp className="text-white" size={20} />
                ) : (
                  <TrendingDown className="text-white" size={20} />
                )}
              </div>
              Monthly Spending Comparison
            </CardTitle>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-all duration-300"
            >
              <X size={20} />
            </button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 py-4">
              {/* Current vs Previous Month Comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Previous Month</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{previousMonth.month}</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    £{previousMonth.total.toFixed(2)}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-700 rounded-xl border border-blue-200 dark:border-slate-600">
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Current Month</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{currentMonth.month}</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    £{currentMonth.total.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {change >= 0 ? (
                      <TrendingUp className="text-red-600" size={16} />
                    ) : (
                      <TrendingDown className="text-green-600" size={16} />
                    )}
                    <span className={`text-sm font-medium ${change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {change >= 0 ? '+' : ''}{changePercent.toFixed(1)}% vs last month
                    </span>
                  </div>
                </div>
              </div>

              {/* Change Summary */}
              <div className={`p-4 rounded-xl border ${change >= 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">
                      {change >= 0 ? 'Spending Increased' : 'Spending Decreased'}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      £{Math.abs(change).toFixed(2)}
                    </p>
                  </div>
                  <div className={`text-right ${change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {change >= 0 ? (
                      <TrendingUp size={48} />
                    ) : (
                      <TrendingDown size={48} />
                    )}
                  </div>
                </div>
              </div>

              {/* 6-Month Trend Bar Chart */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">6-Month Spending Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      label={{ value: 'Spending (£)', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }}
                    />
                    <Tooltip
                      formatter={(value) => `£${value.toFixed(2)}`}
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px'
                      }}
                    />
                    <Bar
                      dataKey="spending"
                      fill="#3b82f6"
                      radius={[8, 8, 0, 0]}
                      name="Spending"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Close Button */}
              <div className="pt-2">
                <Button onClick={onClose} variant="outline" className="w-full">
                  Close
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
