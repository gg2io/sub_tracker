import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { createSubscription, createCategory, createPaymentMethod } from '../services/api';
import { X, Sparkles } from 'lucide-react';

export default function AddSubscriptionModal({ categories, paymentMethods, onClose, onAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    currency: 'GBP',
    billing_cycle: 'monthly',
    category_id: '',
    payment_method_id: '',
    start_date: new Date().toISOString().split('T')[0],
    next_billing_date: '',
    is_active: true
  });

  const [localCategories, setLocalCategories] = useState(categories);
  const [localPaymentMethods, setLocalPaymentMethods] = useState(paymentMethods);
  const [newCategory, setNewCategory] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewPaymentMethod, setShowNewPaymentMethod] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Update local categories when prop changes
  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  // Update local payment methods when prop changes
  useEffect(() => {
    setLocalPaymentMethods(paymentMethods);
  }, [paymentMethods]);

  // Auto-suggest next billing date based on start date and billing cycle
  useEffect(() => {
    if (formData.start_date) {
      const startDate = new Date(formData.start_date);
      let nextBillingDate = new Date(startDate);

      switch (formData.billing_cycle) {
        case 'weekly':
          nextBillingDate.setDate(startDate.getDate() + 7);
          break;
        case 'monthly':
          nextBillingDate.setMonth(startDate.getMonth() + 1);
          break;
        case 'quarterly':
          nextBillingDate.setMonth(startDate.getMonth() + 3);
          break;
        case 'yearly':
          nextBillingDate.setFullYear(startDate.getFullYear() + 1);
          break;
        default:
          nextBillingDate.setMonth(startDate.getMonth() + 1);
      }

      setFormData(prev => ({
        ...prev,
        next_billing_date: nextBillingDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.start_date, formData.billing_cycle]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const response = await createCategory({ name: newCategory });
      // Add new category to local list
      setLocalCategories(prev => [...prev, response.data]);
      // Set the new category as selected
      setFormData(prev => ({ ...prev, category_id: response.data.id }));
      setNewCategory('');
      setShowNewCategory(false);
      setError(null); // Clear any previous errors
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create category');
    }
  };

  const handleAddPaymentMethod = async () => {
    if (!newPaymentMethod.trim()) return;

    try {
      const response = await createPaymentMethod({ name: newPaymentMethod });
      // Add new payment method to local list
      setLocalPaymentMethods(prev => [...prev, response.data]);
      // Set the new payment method as selected
      setFormData(prev => ({ ...prev, payment_method_id: response.data.id }));
      setNewPaymentMethod('');
      setShowNewPaymentMethod(false);
      setError(null); // Clear any previous errors
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create payment method');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        payment_method_id: formData.payment_method_id ? parseInt(formData.payment_method_id) : null
      };

      await createSubscription(data);
      onAdded();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create subscription');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="max-w-2xl w-full animate-scale-in">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-700">
            <CardTitle className="flex items-center gap-2">
              <div className="gradient-primary p-2 rounded-lg">
                <Sparkles className="text-white" size={20} />
              </div>
              Add New Subscription
            </CardTitle>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-all duration-300"
            >
              <X size={20} />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 dark:bg-slate-700 dark:text-white"
                    placeholder="e.g., Netflix, Spotify"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 dark:bg-slate-700 dark:text-white"
                    placeholder="Premium plan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 dark:bg-slate-700 dark:text-white"
                    placeholder="9.99"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Currency
                  </label>
                  <input
                    type="text"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 dark:bg-slate-700 dark:text-white"
                    placeholder="GBP"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Billing Cycle
                  </label>
                  <select
                    name="billing_cycle"
                    value={formData.billing_cycle}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white dark:bg-slate-700 dark:text-white"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Category
                  </label>
                  {!showNewCategory ? (
                    <div className="flex gap-2">
                      <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        className="flex-1 px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white dark:bg-slate-700 dark:text-white"
                      >
                        <option value="">No category</option>
                        {localCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        onClick={() => setShowNewCategory(true)}
                        variant="outline"
                        className="px-4"
                      >
                        New
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="flex-1 px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 dark:bg-slate-700 dark:text-white"
                        placeholder="Category name"
                      />
                      <Button type="button" onClick={handleAddCategory} variant="success" className="px-4">
                        Add
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowNewCategory(false)}
                        variant="outline"
                        className="px-4"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Payment Method
                  </label>
                  {!showNewPaymentMethod ? (
                    <div className="flex gap-2">
                      <select
                        name="payment_method_id"
                        value={formData.payment_method_id}
                        onChange={handleChange}
                        className="flex-1 px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white dark:bg-slate-700 dark:text-white"
                      >
                        <option value="">No payment method</option>
                        {localPaymentMethods.map(method => (
                          <option key={method.id} value={method.id}>{method.name}</option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        onClick={() => setShowNewPaymentMethod(true)}
                        variant="outline"
                        className="px-4"
                      >
                        New
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPaymentMethod}
                        onChange={(e) => setNewPaymentMethod(e.target.value)}
                        className="flex-1 px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 dark:bg-slate-700 dark:text-white"
                        placeholder="e.g., Visa *1234"
                      />
                      <Button type="button" onClick={handleAddPaymentMethod} variant="success" className="px-4">
                        Add
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowNewPaymentMethod(false)}
                        variant="outline"
                        className="px-4"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Next Billing Date
                  </label>
                  <input
                    type="date"
                    name="next_billing_date"
                    value={formData.next_billing_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-300 text-sm font-medium animate-slide-up">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button type="submit" disabled={submitting} variant="primary" className="flex-1">
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Adding...
                    </span>
                  ) : (
                    'Add Subscription'
                  )}
                </Button>
                <Button type="button" onClick={onClose} variant="outline">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
