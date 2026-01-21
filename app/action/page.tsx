'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function ActionContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const action = searchParams.get('action');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!id || !action) {
            setStatus('error');
            setMessage('Invalid link parameters.');
            return;
        }

        const performAction = async () => {
            try {
                const res = await fetch('/api/approve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: Number(id), action }),
                });

                if (res.ok) {
                    setStatus('success');
                    setMessage(`Request ${action}ed successfully!`);
                } else {
                    setStatus('error');
                    setMessage('Failed to process request. It might have already been processed.');
                }
            } catch (err) {
                setStatus('error');
                setMessage('Network error occurred.');
            }
        };

        performAction();
    }, [id, action]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg text-center">
                {status === 'loading' && (
                    <div className="animate-pulse">
                        <h2 className="text-xl font-bold text-gray-700">Processing...</h2>
                        <p className="text-gray-500">Please wait while we update the status.</p>
                    </div>
                )}
                {status === 'success' && (
                    <div>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-gray-900">Success!</h2>
                        <p className="mt-2 text-gray-600 capitalize">{message}</p>
                        <a href="/" className="mt-6 inline-block rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
                            Go to Dashboard
                        </a>
                    </div>
                )}
                {status === 'error' && (
                    <div>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-red-600">Error</h2>
                        <p className="mt-2 text-gray-600">{message}</p>
                        <a href="/" className="mt-6 inline-block rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700">
                            Go to Dashboard
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ActionPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ActionContent />
        </Suspense>
    );
}
