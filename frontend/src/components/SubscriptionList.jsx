import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { getSubscriptions, deleteSubscription, getCategories } from '../services/api';
import { Trash2, Plus, Calendar, Tag } from 'lucide-react';
import AddSubscriptionModal from './AddSubscriptionModal';
import { format } from 'date-fns';

export default function SubscriptionList({ onUpdate }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const [subsRes, catsRes] = await Promise.all([
        getSubscriptions(true),
        getCategories()
      ]);
      setSubscriptions(subsRes.data);
      setCategories(catsRes.data);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        await deleteSubscription(id);
        loadSubscriptions();
        onUpdate();
      } catch (error) {
        console.error('Error deleting subscription:', error);
      }
    }
  };

  const handleAdded = () => {
    setShowAddModal(false);
    loadSubscriptions();
    onUpdate();
  };

  return (
    <>
      <Card hover={true}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full"></div>
            Active Subscriptions
          </CardTitle>
          <Button onClick={() => setShowAddModal(true)} variant="outline" className="flex items-center gap-2">
            <Plus size={18} />
            Add
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : subscriptions.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {subscriptions.map((sub, index) => (
                <div
                  key={sub.id}
                  className="group flex justify-between items-center p-4 bg-gradient-to-r from-slate-50 to-transparent rounded-xl hover:from-blue-50 hover:shadow-md transition-all duration-300 border border-slate-100"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-slate-800 text-lg">{sub.name}</p>
                      {sub.category && (
                        <span
                          className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full text-white font-medium shadow-sm"
                          style={{ backgroundColor: sub.category.color }}
                        >
                          <Tag size={12} />
                          {sub.category.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="font-medium capitalize">{sub.billing_cycle}</span>
                      {sub.next_billing_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          Next: {format(new Date(sub.next_billing_date), 'MMM dd')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-slate-900 text-xl">
                        {sub.currency} {sub.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500">per {sub.billing_cycle.replace('ly', '')}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Plus size={32} className="text-blue-600" />
              </div>
              <p className="font-semibold text-lg mb-2">No subscriptions yet</p>
              <p className="text-sm mb-4">Start tracking your subscriptions</p>
              <Button onClick={() => setShowAddModal(true)} variant="primary" className="mx-auto">
                Add Your First Subscription
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showAddModal && (
        <AddSubscriptionModal
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onAdded={handleAdded}
        />
      )}
    </>
  );
}
