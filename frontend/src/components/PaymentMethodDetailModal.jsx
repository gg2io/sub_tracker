import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { X, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

export default function PaymentMethodDetailModal({ paymentMethod, subscriptions, onClose, onSubscriptionClick }) {
  // Filter subscriptions that use this payment method
  const filteredSubscriptions = subscriptions.filter(
    sub => sub.payment_method?.id === paymentMethod.payment_method_id
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-700">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="gradient-primary p-2 rounded-lg">
                  <CreditCard className="text-white" size={20} />
                </div>
                {paymentMethod.payment_method_name}
              </CardTitle>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Summary */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-700 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Total Spending</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    £{paymentMethod.total.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Transactions</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {paymentMethod.transaction_count}
                  </p>
                </div>
              </div>
            </div>

            {/* Subscriptions */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Subscriptions using this card
              </h3>
              <div className="max-h-[50vh] overflow-y-auto">
                {filteredSubscriptions.length > 0 ? (
                  <div className="space-y-3">
                    {filteredSubscriptions.map(sub => (
                      <div
                        key={sub.id}
                        onClick={() => {
                          onSubscriptionClick(sub);
                          onClose();
                        }}
                        className="p-4 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                              {sub.name}
                            </h4>
                            {sub.description && (
                              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                                {sub.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <span className="font-medium">
                                  £{sub.amount.toFixed(2)}/{sub.billing_cycle}
                                </span>
                              </span>
                              {sub.next_billing_date && (
                                <span>
                                  Next: {format(new Date(sub.next_billing_date), 'MMM dd, yyyy')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            sub.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                          }`}>
                            {sub.is_active ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                    <CreditCard size={48} className="mx-auto mb-3 opacity-20" />
                    <p>No subscriptions using this payment method</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
