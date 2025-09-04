'use client';

import { useState } from 'react';
import { createLink, LocalLink, getShortUrl } from '@/lib/api';
import { Link2, Copy, Check } from 'lucide-react';
import { formatDate, getTimeUntilExpiry } from '@/lib/utils';

interface UrlFormProps {
    onLinkCreated: (link: LocalLink) => void;
}

export default function UrlForm({ onLinkCreated }: UrlFormProps) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState<LocalLink | null>(null);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(null);
        setCopied(false);

        if (!url) {
            setError('Please enter a URL');
            return;
        }

        setLoading(true);
        try {
            const link = await createLink(url);

            setSuccess(link);
            onLinkCreated(link);
            setUrl('');

            setTimeout(() => setSuccess(null), 10000);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!success) return;

        try {
            await navigator.clipboard.writeText(getShortUrl(success.shortId));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="w-full space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="url"
                        placeholder="https://example.com/very-long-url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="flex-1 h-14 px-6 text-lg border-2 rounded-2xl bg-white focus:border-primary focus:outline-none transition-all duration-200"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !url.trim()}
                        className="h-14 px-8 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                        <Link2 className="w-5 h-5" />
                        {loading ? 'Creating...' : 'Shorten'}
                    </button>
                </div>
            </form>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-5 bg-green-50/50 rounded-2xl border border-green-200/50">
                    <p className="text-sm font-medium text-green-700 mb-3">
                        Link created successfully!
                    </p>
                    
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-600 mb-1 text-center">Short URL:</p>
                            <div className="flex items-center justify-center gap-2">
                                <a
                                    href={getShortUrl(success.shortId)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-base font-mono text-blue-800 hover:text-blue-1000 hover:underline break-all"
                                >
                                    {getShortUrl(success.shortId)}
                                </a>
                                <button
                                    onClick={handleCopy}
                                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                                    title={copied ? "Copied!" : "Copy to clipboard"}
                                    aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
                                >
                                    {copied ? (
                                        <Check className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                            Expires: {formatDate(success.expiresAt)} ({getTimeUntilExpiry(success.expiresAt)})
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}