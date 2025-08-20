import React, { useState } from 'react';

const Debug: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testFunction = async (url: string, method: string = 'GET', body?: any) => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.PROD ? '/.netlify/functions' : '/api';
      const response = await fetch(`${apiUrl}${url}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      
      const result = await response.json();
      setTestResults(prev => [...prev, {
        url,
        method,
        status: response.status,
        result,
        timestamp: new Date().toISOString()
      }]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setTestResults(prev => [...prev, {
        url,
        method,
        status: 'ERROR',
        result: { error: message },
        timestamp: new Date().toISOString()
      }]);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Netlify Functions Debug</h1>
      
      <div className="space-y-4 mb-8">
        <button
          onClick={() => testFunction('/test')}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Test Function
        </button>
        
        <button
          onClick={() => testFunction('/simple-auth/register', 'POST', {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123'
          })}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
        >
          Test Register
        </button>
        
        <button
          onClick={() => testFunction('/simple-auth/login', 'POST', {
            emailOrUsername: 'test@example.com',
            password: 'password123'
          })}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded mr-2"
        >
          Test Login
        </button>
        
        <button
          onClick={() => setTestResults([])}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Clear Results
        </button>
      </div>

      <div className="space-y-4">
        {testResults.map((result, index) => (
          <div key={index} className="border p-4 rounded bg-gray-50">
            <div className="font-bold">
              {result.method} {result.url} - Status: {result.status}
            </div>
            <div className="text-sm text-gray-600 mb-2">{result.timestamp}</div>
            <pre className="bg-black text-green-400 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(result.result, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Debug;
