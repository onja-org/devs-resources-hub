'use client';

import { seedDefaultResources } from '@/lib/seed';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useState } from 'react';

export default function SeedPage() {
  const [checking, setChecking] = useState(false);
  const [resourceCount, setResourceCount] = useState<number | null>(null);

  const checkResources = async () => {
    setChecking(true);
    try {
      const resourcesRef = collection(db, 'resources');
      const querySnapshot = await getDocs(resourcesRef);
      const count = querySnapshot.size;
      setResourceCount(count);
      
      alert(`Found ${count} resources in database.`);
    } catch (error) {
      console.error('Error checking resources:', error);
      alert('Failed to check resources.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Seed Database
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Click the button below to add default resources to your Firestore database.
        </p>
        
        {resourceCount !== null && (
          <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg">
            <p className="font-semibold">Database Status:</p>
            <p className="text-sm">{resourceCount} resources found</p>
          </div>
        )}
        
        <div className="space-y-3">
          <button
            onClick={async () => {
              try {
                const result = await seedDefaultResources();
                
                if (result.success) {
                  alert(`Successfully added ${result.count} resources!`);
                  await checkResources();
                } else {
                  alert(`Failed to add resources. Error: ${result.error?.message || 'Unknown error'}`);
                }
              } catch (error: any) {
                alert(`Error: ${error.message}`);
              }
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Seed Default Resources
          </button>
          
          <button
            onClick={checkResources}
            disabled={checking}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {checking ? 'Checking...' : 'Check Database'}
          </button>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Note: Make sure your Firebase credentials are configured in .env.local
        </p>
      </div>
    </div>
  );
}
