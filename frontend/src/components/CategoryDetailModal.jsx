import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { X, Tag, Calendar, DollarSign } from 'lucide-react';
import { getSubscriptions } from '../services/api';
import { format } from 'date-fns';

export default function CategoryDetailModal({ category, onClose }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategorySubscriptions = async () => {
      try {
        setLoading(true);
        const response = await getSubscriptions(true);
        // Filter subscriptions by category
        const filtered = response.data.filter(
          sub => sub.category && sub.category.id === category.id
        );
        setSubscriptions(filtered);
      } catch (error) {
        console.error('Error loading subscriptions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      loadCategorySubscriptions();
    }
  }, [category]);

  if (!category) return null;

  const totalMonthly = subscriptions.reduce((sum, sub) => {
    if (sub.billing_cycle === 'monthly') return sum + sub.amount;
    if (sub.billing_cycle === 'yearly') return sum + (sub.amount / 12);
    if (sub.billing_cycle === 'quarterly') return sum + (sub.amount / 3);
    return sum;
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="max-w-2xl w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between" style={{ backgroundColor: `${category.color}15` }}>
            <CardTitle className="flex items-center gap-3">
              <div className="p-3 rounded-xl" style={{ backgroundColor: category.color }}>
                <Tag className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{category.name}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-normal mt-1">
                  {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''} • £{totalMonthly.toFixed(2)}/month avg
                </p>
              </div>
            </CardTitle>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-all duration-300"
            >
              <X size={20} />
            </button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : subscriptions.length > 0 ? (
              <div className="space-y-4 py-4">
                {subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-5 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{sub.name}</h3>
                        {sub.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-300">{sub.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          £{sub.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                          per {sub.billing_cycle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Calendar size={16} />
                        <span>Started: {format(new Date(sub.start_date), 'MMM dd, yyyy')}</span>
                      </div>
                      {sub.next_billing_date && (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <DollarSign size={16} />
                          <span>Next: {format(new Date(sub.next_billing_date), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                    </div>

                    {/* Monthly equivalent */}
                    {sub.billing_cycle !== 'monthly' && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Monthly equivalent: £
                          {sub.billing_cycle === 'yearly'
                            ? (sub.amount / 12).toFixed(2)
                            : sub.billing_cycle === 'quarterly'
                            ? (sub.amount / 3).toFixed(2)
                            : sub.amount.toFixed(2)
                          }
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Summary */}
                <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-700 rounded-xl border border-blue-200 dark:border-slate-600">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Total Subscriptions</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{subscriptions.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Avg Monthly Cost</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">£{totalMonthly.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                <Tag size={48} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium">No subscriptions in this category</p>
              </div>
            )}

            <div className="pt-4">
              <Button onClick={onClose} variant="outline" className="w-full">
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
