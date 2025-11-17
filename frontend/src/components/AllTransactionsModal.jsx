import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { X, Receipt } from 'lucide-react';

export default function AllTransactionsModal({ transactions, onClose, onTransactionClick }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-700">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="gradient-primary p-2 rounded-lg">
                  <Receipt className="text-white" size={20} />
                </div>
                All Recent Activity
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
            <div className="max-h-[70vh] overflow-y-auto">
              {transactions && transactions.length > 0 ? (
                <div className="space-y-2">
                  {transactions.map((transaction, index) => (
                    <div
                      key={transaction.id}
                      onClick={() => {
                        onTransactionClick(transaction);
                        onClose();
                      }}
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-600 transition-colors cursor-pointer border border-slate-100 dark:border-slate-600 hover:border-blue-200 dark:hover:border-blue-500"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`px-3 py-1 rounded-md text-xs font-medium flex-shrink-0 ${
                          index === 0 ? 'bg-blue-100 text-blue-700' :
                          index === 1 ? 'bg-yellow-100 text-yellow-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-200'
                        }`}>
                          {transaction.merchant || 'Unknown'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{transaction.description}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
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
                  <p>No transactions found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
