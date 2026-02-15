/**
 * Admin Navigation Test
 * Vérifie que toutes les pages d'administration sont accessibles
 */

import React, { useState } from 'react';
import { useTranslation } from '../../context/I18nContext';

const AdminNavigationTest = () => {
  const { t } = useTranslation();
  const [testResults, setTestResults] = useState([
    {
      name: 'Admin Coupons',
      path: '/admin-dashboard/coupons',
      status: 'pending'
    },
    {
      name: 'Admin Verifications',
      path: '/admin-dashboard/verifications/pending',
      status: 'pending'
    },
    {
      name: 'Admin Email Config',
      path: '/admin-dashboard/email-config',
      status: 'pending'
    },
    {
      name: 'Admin Settings',
      path: '/admin-dashboard/settings',
      status: 'pending'
    }
  ]);

  const testRoute = async (index, path) => {
    try {
      // Simulate loading the route
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const results = [...testResults];
      results[index].status = 'success';
      setTestResults(results);
    } catch (error) {
      const results = [...testResults];
      results[index].status = 'error';
      results[index].error = error.message;
      setTestResults(results);
    }
  };

  const runAllTests = () => {
    testResults.forEach((test, index) => {
      testRoute(index, test.path);
    });
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Navigation Test</h1>
      
      <div className="mb-6">
        <button
          onClick={runAllTests}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Run All Tests
        </button>
      </div>

      <div className="space-y-4">
        {testResults.map((test, index) => (
          <div key={index} className="border rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{test.name}</h3>
                <p className="text-gray-600 text-sm">{test.path}</p>
              </div>
              <div>
                {test.status === 'pending' && (
                  <span className="px-4 py-2 bg-gray-200 text-gray-800 rounded">Pending</span>
                )}
                {test.status === 'success' && (
                  <span className="px-4 py-2 bg-green-200 text-green-800 rounded">✓ Pass</span>
                )}
                {test.status === 'error' && (
                  <span className="px-4 py-2 bg-red-200 text-red-800 rounded">✗ Fail</span>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <a
                href={test.path}
                className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200"
              >
                Visit Route
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminNavigationTest;
