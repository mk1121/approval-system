'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Request = {
  ID: number;
  REQUEST_DATA: string;
  CREATED_AT: string;
  USER_EMAIL?: string;
};

export default function Dashboard() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Basic Auth Check
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }

    fetchRequests();
    // Real-time polling every 5 seconds
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, [router]);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error('Failed to fetch requests', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      // Optimistic visual update could technically happen here, but we'll stick to simple refetch
      await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      fetchRequests();
    } catch (error) {
      console.error('Action failed', error);
      alert('Failed to process action');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          <div className="text-lg font-medium text-gray-600 animate-pulse">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12 transition-colors duration-500">
      {/* Decorative background blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-indigo-100/50 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-purple-100/50 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        <header className="mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass p-6 rounded-3xl animate-fade-in-down">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              Approval Dashboard
            </h1>
            <p className="mt-2 text-lg text-gray-500 font-medium">
              Manage incoming requests with ease ✨
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('user');
              router.push('/login');
            }}
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:shadow-md hover:bg-gray-50 border border-gray-100 transition-all duration-200 active:scale-95"
          >
            Sign Out
          </button>
        </header>

        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white/50 p-16 text-center animate-fade-in-up">
            <div className="mb-4 rounded-full bg-indigo-50 p-4">
              <svg className="h-12 w-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-2 text-xl font-bold text-gray-900">All caught up!</h3>
            <p className="mt-2 text-gray-500 max-w-sm mx-auto">
              There are no pending requests at the moment. Great job clearing the queue! 🎉
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {requests.map((req, index) => (
              <div
                key={req.ID}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 border border-gray-100"
                style={{ animation: `fade-in-up 0.5s ease-out ${index * 0.1}s backwards` }}
              >
                <div className="absolute top-0 right-0 h-32 w-32 translate-x-12 -translate-y-12 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600 border border-amber-100">
                      <span className="mr-1.5 h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                      Pending
                    </span>
                    <span className="text-xs font-medium text-gray-400">
                      {new Date(req.CREATED_AT).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
                    Request <span className="text-indigo-600">#{req.ID}</span>
                  </h3>

                  <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-sm text-gray-600 font-mono break-all border border-gray-100/50 shadow-inner">
                    {req.REQUEST_DATA}
                  </div>

                  {req.USER_EMAIL && (
                    <div className="mb-4 flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-xl w-fit">
                      <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm text-xs font-bold text-indigo-500 border border-gray-100">
                        {req.USER_EMAIL.charAt(0).toUpperCase()}
                      </div>
                      {req.USER_EMAIL}
                    </div>
                  )}
                </div>

                <div className="relative z-10 mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-gray-50">
                  <button
                    onClick={() => handleAction(req.ID, 'reject')}
                    className="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 hover:border-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all active:scale-95"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction(req.ID, 'approve')}
                    className="flex w-full items-center justify-center rounded-xl border border-transparent bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all active:scale-95"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
