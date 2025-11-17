import { useState, useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Bell, Check, AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import { format } from 'date-fns';

export default function NotificationPanel({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      loadNotifications();
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      loadNotifications();
    } catch (error) {
      console.error('Error marking all read:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'warning':
        return <AlertCircle className="text-orange-600" size={20} />;
      case 'alert':
        return <AlertCircle className="text-red-600" size={20} />;
      default:
        return <Info className="text-blue-600" size={20} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex justify-end" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 w-full max-w-md h-full shadow-2xl overflow-y-auto animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={24} className="text-slate-700 dark:text-slate-200" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <X size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="p-6">
            {notifications.length > 0 && (
              <div className="mb-4">
                <Button
                  onClick={handleMarkAllRead}
                  variant="outline"
                  className="w-full"
                >
                  Mark All as Read
                </Button>
              </div>
            )}

            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No notifications</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-xl border transition-all ${
                      notification.is_read
                        ? 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {format(new Date(notification.created_at), 'MMM dd, yyyy · hh:mm a')}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkRead(notification.id)}
                          className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <Check size={18} className="text-blue-600" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
