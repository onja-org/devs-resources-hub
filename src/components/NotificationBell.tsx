'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Notification } from '@/types/resource';
import Link from 'next/link';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  async function fetchNotifications() {
    if (!user) return;

    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(notificationsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      const fetchedNotifications: Notification[] = [];
      let unread = 0;

      querySnapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const notification: Notification = {
          id: docSnap.id,
          userId: data.userId,
          type: data.type,
          resourceId: data.resourceId,
          resourceTitle: data.resourceTitle,
          fromUserId: data.fromUserId,
          fromUserName: data.fromUserName,
          message: data.message,
          read: data.read || false,
          createdAt: data.createdAt,
        };
        fetchedNotifications.push(notification);
        if (!notification.read) unread++;
      });

      // Sort by newest first
      fetchedNotifications.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });

      setNotifications(fetchedNotifications);
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
      
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async function deleteNotification(notificationId: string, event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationRef);
      
      // Update local state
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  async function clearAllNotifications() {
    if (!user || notifications.length === 0) return;
    
    if (!confirm('Are you sure you want to clear all notifications?')) return;
    
    try {
      const batch = writeBatch(db);
      notifications.forEach((notification) => {
        const notificationRef = doc(db, 'notifications', notification.id);
        batch.delete(notificationRef);
      });
      await batch.commit();
      
      // Update local state
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10 cursor-pointer" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-20 max-h-96 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold cursor-pointer transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
            
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => {
                    // Determine notification icon and color based on type
                    let icon: React.ReactNode;
                    let bgColor: string;
                    
                    if (notification.type === 'resource_approved') {
                      icon = (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      );
                      bgColor = 'bg-gradient-to-r from-green-500 to-green-600';
                    } else if (notification.type === 'resource_declined') {
                      icon = (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      );
                      bgColor = 'bg-gradient-to-r from-red-500 to-red-600';
                    } else {
                      // recommendation type
                      icon = notification.fromUserName?.substring(0, 2).toUpperCase() || 'RE';
                      bgColor = 'bg-gradient-to-r from-purple-500 to-purple-600';
                    }

                    return (
                      <div key={notification.id} className="relative group">
                        <Link
                          href={notification.resourceId ? `/?resourceId=${notification.resourceId}` : '/'}
                          onClick={() => {
                            markAsRead(notification.id);
                            setIsOpen(false);
                          }}
                          className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer block ${
                            !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                              {typeof icon === 'string' ? icon : icon}
                            </div>
                            <div className="flex-1 min-w-0 pr-6">
                            <p className="text-sm text-gray-900 dark:text-white mb-1">
                              {notification.type === 'recommendation' && notification.fromUserName && (
                                <>
                                  <span className="font-semibold">{notification.fromUserName}</span>
                                  {' recommended '}
                                  <span className="font-semibold">{notification.resourceTitle}</span>
                                </>
                              )}
                              {notification.type === 'resource_approved' && (
                                <>
                                  <span className="font-semibold">Resource Approved!</span>
                                  <br />
                                  <span className="text-gray-600 dark:text-gray-400">{notification.message}</span>
                                </>
                              )}
                              {notification.type === 'resource_declined' && (
                                <>
                                  <span className="font-semibold">Resource Declined</span>
                                  <br />
                                  <span className="text-gray-600 dark:text-gray-400">{notification.message}</span>
                                </>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {notification.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </Link>
                      <button
                        onClick={(e) => deleteNotification(notification.id, e)}
                        className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                        title="Delete notification"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
