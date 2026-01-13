'use client';

import { useState } from 'react';
import { FiMail, FiCheck, FiX, FiAlertCircle, FiRefreshCw, FiSettings } from 'react-icons/fi';

export default function EmailDebugPage() {
    const [testEmail, setTestEmail] = useState('');
    const [testing, setTesting] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [queueStatus, setQueueStatus] = useState<any>(null);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    const testEmailConnection = async () => {
        if (!testEmail) {
            alert('Please enter a test email address');
            return;
        }

        setTesting(true);
        setResult(null);
        setLogs([]);
        addLog('Starting email test...');

        try {
            addLog(`Sending test email to: ${testEmail}`);

            const response = await fetch('/api/email/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ to: testEmail }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                addLog('✓ Test email sent successfully!');
                setResult({ success: true, message: data.message });
            } else {
                addLog('✗ Test email failed');
                addLog(`Error: ${data.error || data.message}`);
                setResult({
                    success: false,
                    error: data.error || data.message,
                    details: data
                });
            }
        } catch (error: any) {
            addLog('✗ Network error occurred');
            addLog(`Error: ${error.message}`);
            setResult({
                success: false,
                error: error.message,
                details: 'Check if API is running and accessible'
            });
        } finally {
            setTesting(false);
            await checkQueueStatus();
        }
    };

    const checkQueueStatus = async () => {
        try {
            addLog('Checking email queue status...');
            const response = await fetch('/api/email/queue-status', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setQueueStatus(data);
                addLog(`Queue length: ${data.queueLength}`);
                addLog(`Processing: ${data.isProcessing ? 'Yes' : 'No'}`);
                addLog(`Custom transporter: ${data.hasCustomTransporter ? 'Active' : 'Inactive'}`);
            }
        } catch (error) {
            addLog('Could not fetch queue status');
        }
    };

    const clearQueue = async () => {
        if (!confirm('Are you sure you want to clear the email queue?')) return;

        try {
            addLog('Clearing email queue...');
            const response = await fetch('/api/email/clear-queue', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                addLog(`✓ Queue cleared: ${data.cleared} emails removed`);
                await checkQueueStatus();
            }
        } catch (error) {
            addLog('✗ Failed to clear queue');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                            <FiMail className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email System Debugger</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Diagnose and fix email delivery issues</p>
                        </div>
                    </div>
                </div>

                {/* Current Configuration */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FiSettings className="w-5 h-5" />
                        Current SMTP Configuration
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Host:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">mail.mclinic.co.ke</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Port:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">587</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Username:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">portal@mclinic.co.ke</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">SSL/TLS:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">Disabled (Port 587)</span>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Common cPanel Issues:</h3>
                        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                            <li>• Username must be <strong>full email address</strong> (portal@mclinic.co.ke)</li>
                            <li>• Password must match exactly (no extra spaces)</li>
                            <li>• Port 587 requires SSL/TLS = <strong>OFF</strong></li>
                            <li>• Port 465 requires SSL/TLS = <strong>ON</strong></li>
                            <li>• Check cPanel firewall isn't blocking port 587</li>
                        </ul>
                    </div>
                </div>

                {/* Test Email */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Send Test Email</h2>
                    <div className="flex gap-3">
                        <input
                            type="email"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            placeholder="Enter your email address"
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={testEmailConnection}
                            disabled={testing}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {testing ? (
                                <>
                                    <FiRefreshCw className="w-4 h-4 animate-spin" />
                                    Testing...
                                </>
                            ) : (
                                <>
                                    <FiMail className="w-4 h-4" />
                                    Send Test
                                </>
                            )}
                        </button>
                    </div>

                    {/* Result */}
                    {result && (
                        <div className={`mt-4 p-4 rounded-lg border ${result.success
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            }`}>
                            <div className="flex items-start gap-3">
                                {result.success ? (
                                    <FiCheck className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <FiX className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <h3 className={`font-semibold ${result.success
                                            ? 'text-green-800 dark:text-green-200'
                                            : 'text-red-800 dark:text-red-200'
                                        }`}>
                                        {result.success ? 'Success!' : 'Failed'}
                                    </h3>
                                    <p className={`text-sm mt-1 ${result.success
                                            ? 'text-green-700 dark:text-green-300'
                                            : 'text-red-700 dark:text-red-300'
                                        }`}>
                                        {result.message || result.error}
                                    </p>
                                    {result.details && !result.success && (
                                        <pre className="mt-2 text-xs bg-red-100 dark:bg-red-900/30 p-2 rounded overflow-x-auto">
                                            {typeof result.details === 'string' ? result.details : JSON.stringify(result.details, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Queue Status */}
                {queueStatus && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Email Queue Status</h2>
                            <button
                                onClick={clearQueue}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
                            >
                                Clear Queue
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{queueStatus.queueLength}</div>
                                <div className="text-sm text-blue-700 dark:text-blue-300">Emails in Queue</div>
                            </div>
                            <div className={`p-4 rounded-lg border ${queueStatus.isProcessing
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                                }`}>
                                <div className={`text-2xl font-bold ${queueStatus.isProcessing
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-gray-600 dark:text-gray-400'
                                    }`}>
                                    {queueStatus.isProcessing ? 'Active' : 'Idle'}
                                </div>
                                <div className="text-sm text-gray-700 dark:text-gray-300">Processing Status</div>
                            </div>
                            <div className={`p-4 rounded-lg border ${queueStatus.hasCustomTransporter
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                                }`}>
                                <div className={`text-2xl font-bold ${queueStatus.hasCustomTransporter
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-yellow-600 dark:text-yellow-400'
                                    }`}>
                                    {queueStatus.hasCustomTransporter ? 'Active' : 'Fallback'}
                                </div>
                                <div className="text-sm text-gray-700 dark:text-gray-300">SMTP Transporter</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Debug Logs */}
                {logs.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Debug Logs</h2>
                        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                            {logs.map((log, index) => (
                                <div key={index} className="mb-1">{log}</div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Troubleshooting Guide */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FiAlertCircle className="w-5 h-5" />
                        Troubleshooting Steps
                    </h2>
                    <div className="space-y-4 text-sm">
                        <div className="border-l-4 border-blue-500 pl-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white">1. Verify cPanel Email Account</h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Go to cPanel → Email Accounts → Verify <strong>portal@mclinic.co.ke</strong> exists and password is correct
                            </p>
                        </div>
                        <div className="border-l-4 border-blue-500 pl-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white">2. Check Port Accessibility</h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Run on server: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">telnet mail.mclinic.co.ke 587</code>
                            </p>
                        </div>
                        <div className="border-l-4 border-blue-500 pl-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white">3. Try Alternative Port</h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                If port 587 fails, try port <strong>465</strong> with <strong>SSL/TLS enabled</strong>
                            </p>
                        </div>
                        <div className="border-l-4 border-blue-500 pl-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white">4. Check API Logs</h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Run: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">pm2 logs mclinic-api --lines 50</code>
                            </p>
                        </div>
                        <div className="border-l-4 border-blue-500 pl-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white">5. Use Gmail as Temporary Fix</h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Host: <strong>smtp.gmail.com</strong>, Port: <strong>587</strong>, Use App Password
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
