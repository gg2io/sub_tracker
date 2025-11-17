import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { X, Calendar, CreditCard, Tag, DollarSign, Receipt } from 'lucide-react';
import { format } from 'date-fns';

export default function TransactionDetailModal({ transaction, onClose }) {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="max-w-lg w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-700">
            <CardTitle className="flex items-center gap-2">
              <div className="gradient-primary p-2 rounded-lg">
                <Receipt className="text-white" size={20} />
              </div>
              Transaction Details
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
              {/* Description */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {transaction.description}
                </h3>
                {transaction.merchant && (
                  <p className="text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <Tag size={16} />
                    {transaction.merchant}
                  </p>
                )}
              </div>

              {/* Amount */}
              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Amount</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {transaction.currency} {Math.abs(transaction.amount).toFixed(2)}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 mb-2">
                    <Calendar size={16} />
                    <p className="text-sm font-medium">Date</p>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {format(new Date(transaction.date), 'MMM dd, yyyy')}
                  </p>
                </div>

                {/* Payment Method */}
                <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 mb-2">
                    <CreditCard size={16} />
                    <p className="text-sm font-medium">Card Used</p>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {transaction.payment_method?.name || 'Not specified'}
                  </p>
                </div>

                {/* Currency */}
                <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 mb-2">
                    <DollarSign size={16} />
                    <p className="text-sm font-medium">Currency</p>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {transaction.currency}
                  </p>
                </div>

                {/* Status */}
                <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 mb-2">
                    <Receipt size={16} />
                    <p className="text-sm font-medium">Status</p>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {transaction.is_matched ? (
                      <span className="text-green-600">Matched</span>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400">Unmatched</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Transaction ID */}
              <div className="text-xs text-slate-500 dark:text-slate-400 text-center pt-2 border-t border-slate-200 dark:border-slate-700">
                Transaction ID: {transaction.id}
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
