import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { X, Trash2, Plus, Tag, CreditCard } from 'lucide-react';
import { createCategory, deleteCategory, createPaymentMethod, deletePaymentMethod } from '../services/api';

export default function SettingsModal({ categories, paymentMethods, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState('categories');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');
  const [newPaymentMethodName, setNewPaymentMethodName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      setLoading(true);
      setError('');
      await createCategory({ name: newCategoryName.trim(), color: newCategoryColor });
      setNewCategoryName('');
      setNewCategoryColor('#3b82f6');
      onUpdate();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!confirm(`Delete category "${name}"? This will fail if it's in use by subscriptions.`)) return;

    try {
      setLoading(true);
      setError('');
      await deleteCategory(id);
      onUpdate();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async (e) => {
    e.preventDefault();
    if (!newPaymentMethodName.trim()) return;

    try {
      setLoading(true);
      setError('');
      await createPaymentMethod({ name: newPaymentMethodName.trim() });
      setNewPaymentMethodName('');
      onUpdate();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add payment method');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (id, name) => {
    if (!confirm(`Delete payment method "${name}"? This will fail if it's in use.`)) return;

    try {
      setLoading(true);
      setError('');
      await deletePaymentMethod(id);
      onUpdate();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete payment method');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-700">
            <div className="flex items-center justify-between">
              <CardTitle>Settings</CardTitle>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('categories')}
                className={`px-4 py-2 font-medium transition-all ${
                  activeTab === 'categories'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Tag size={18} />
                  Categories
                </div>
              </button>
              <button
                onClick={() => setActiveTab('payment-methods')}
                className={`px-4 py-2 font-medium transition-all ${
                  activeTab === 'payment-methods'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CreditCard size={18} />
                  Payment Methods
                </div>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="max-h-[60vh] overflow-y-auto">
              {/* Categories Tab */}
              {activeTab === 'categories' && (
                <div className="space-y-4">
                  {/* Add Category Form */}
                  <form onSubmit={handleAddCategory} className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Add New Category</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Category name"
                        className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-600 dark:text-white"
                        disabled={loading}
                      />
                      <input
                        type="color"
                        value={newCategoryColor}
                        onChange={(e) => setNewCategoryColor(e.target.value)}
                        className="w-12 h-10 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer"
                        disabled={loading}
                      />
                      <Button type="submit" disabled={loading || !newCategoryName.trim()}>
                        <Plus size={18} />
                      </Button>
                    </div>
                  </form>

                  {/* Categories List */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Your Categories</h3>
                    {categories.length === 0 ? (
                      <p className="text-slate-500 dark:text-slate-400 text-center py-8">No categories yet</p>
                    ) : (
                      categories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:border-slate-300 dark:hover:border-slate-500 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="font-medium text-slate-900 dark:text-white">{category.name}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteCategory(category.id, category.name)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            disabled={loading}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Payment Methods Tab */}
              {activeTab === 'payment-methods' && (
                <div className="space-y-4">
                  {/* Add Payment Method Form */}
                  <form onSubmit={handleAddPaymentMethod} className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Add New Payment Method</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPaymentMethodName}
                        onChange={(e) => setNewPaymentMethodName(e.target.value)}
                        placeholder="e.g., Visa *1234"
                        className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-600 dark:text-white"
                        disabled={loading}
                      />
                      <Button type="submit" disabled={loading || !newPaymentMethodName.trim()}>
                        <Plus size={18} />
                      </Button>
                    </div>
                  </form>

                  {/* Payment Methods List */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Your Payment Methods</h3>
                    {paymentMethods.length === 0 ? (
                      <p className="text-slate-500 dark:text-slate-400 text-center py-8">No payment methods yet</p>
                    ) : (
                      paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:border-slate-300 dark:hover:border-slate-500 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <CreditCard size={18} className="text-slate-600 dark:text-slate-300" />
                            <span className="font-medium text-slate-900 dark:text-white">{method.name}</span>
                          </div>
                          <button
                            onClick={() => handleDeletePaymentMethod(method.id, method.name)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            disabled={loading}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
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
