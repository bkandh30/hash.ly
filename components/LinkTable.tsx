'use client';

import { useState, useEffect } from 'react';
import { QrCode, ExternalLink, TrendingUp, Calendar } from 'lucide-react';
import { LocalLink, getShortUrl, StatsResponse, getBatchStats } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import QrModal from './QrModal';
import CopyButton from './CopyButton';

interface LinkTableProps {
    links: LocalLink[];
}

interface LinkWithStats extends LocalLink {
    stats?: StatsResponse;
    loading?: boolean;
    previousClicks?: number;
}

export default function LinkTable({ links }: LinkTableProps) {
    const [linksWithStats, setLinksWithStats] = useState<LinkWithStats[]>(() => 
        links.map((link) => ({ ...link, loading: true }))
    );
    const [selectedQr, setSelectedQr] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchAllStats = async () => {
            if (links.length === 0) return;
            
            setLinksWithStats(prev => {
                if (prev.length > 0 && !prev[0].loading) {
                    setIsUpdating(true);
                }
                return prev;
            });

            try {
                const shortIds = links.map(link => link.shortId);
                
                const batchResponse = await getBatchStats(shortIds);
                
                setLinksWithStats(prevLinks => {
                    const updatedLinks = links.map(link => {
                        const statsData = batchResponse.data[link.shortId];
                        
                        const existingLink = prevLinks.find(l => l.shortId === link.shortId);
                        const previousClicks = existingLink?.stats?.clicks || 0;
                        
                        if (statsData && !('error' in statsData)) {
                            return {
                                ...link,
                                stats: statsData as StatsResponse,
                                loading: false,
                                previousClicks: previousClicks,
                            };
                        } else {
                            return {
                                ...link,
                                stats: existingLink?.stats,
                                loading: false,
                                previousClicks: previousClicks,
                            };
                        }
                    });
                    
                    return updatedLinks;
                });
            } catch (error) {
                console.error('Failed to fetch batch stats:', error);
                setLinksWithStats(prev => 
                    prev.map(link => ({ ...link, loading: false }))
                );
            } finally {
                setIsUpdating(false);
            }
        };

        fetchAllStats();

        const interval = setInterval(() => {
            fetchAllStats();
        }, 10000);

        return () => clearInterval(interval);
    }, [links]);

    if (links.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-2xl flex items-center justify-center">
                    <ExternalLink className="w-12 h-12 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No links yet</h2>
                <p className="text-muted-foreground">
                    Paste a URL above to get started with your first shortened link
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Your Links</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className={`w-2 h-2 rounded-full ${
                            isUpdating ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
                        }`} />
                        <span>{isUpdating ? 'Updating...' : 'Live updates'}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {linksWithStats.map((link) => {
                        const isExpired = new Date(link.expiresAt) < new Date();
                        const hasNewClicks = link.stats && link.previousClicks !== undefined && 
                                            link.stats.clicks > link.previousClicks;

                        return (
                            <div
                                key={link.shortId}
                                className={`p-6 bg-card rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                                    isExpired ? 'border-destructive/50 bg-destructive/5' : ''
                                } ${hasNewClicks ? 'border-green-500/50 shadow-green-100' : ''}`}
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-sm text-muted-foreground font-bold">
                                                    Original URL
                                                </p>
                                                {isExpired && (
                                                    <span className="px-2 py-0.5 bg-destructive text-destructive-foreground text-xs rounded-full">
                                                        Expired
                                                    </span>
                                                )}
                                            </div>
                                            <a
                                                href={link.longUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-foreground hover:text-primary transition-colors break-all"
                                                title={link.longUrl}
                                            >
                                                {link.longUrl.length > 60
                                                    ? link.longUrl.substring(0, 60) + '...'
                                                    : link.longUrl}
                                            </a>
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1 font-bold">
                                                Short URL
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={getShortUrl(link.shortId)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-mono text-base font-medium text-blue-700 hover:underline"
                                                >
                                                    {getShortUrl(link.shortId)}
                                                </a>
                                                <CopyButton text={getShortUrl(link.shortId)} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                            <div 
                                                className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all duration-300 ${
                                                    hasNewClicks 
                                                        ? 'bg-green-100 scale-105' 
                                                        : 'bg-muted'
                                                }`}
                                                title="Clicks"
                                                aria-label={`${link.stats?.clicks || 0} clicks`}
                                            >
                                                <TrendingUp className={`w-4 h-4 ${
                                                    hasNewClicks ? 'text-green-600' : 'text-primary'
                                                }`} />
                                                <span className={`font-semibold ${
                                                    hasNewClicks ? 'text-green-600' : ''
                                                }`}>
                                                    {link.loading ? (
                                                        '...'
                                                    ) : (
                                                        `${link.stats?.clicks || 0} click${
                                                            link.stats?.clicks === 1 ? '' : 's'
                                                        }`
                                                    )}
                                                </span>
                                            </div>
                                            <div
                                                className="flex items-center gap-1"
                                                title={`Created on ${formatDate(link.createdAt)}`}
                                            >
                                                <Calendar className="w-4 h-4" />
                                                <span>{formatDate(link.createdAt)}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setSelectedQr(link.shortId)}
                                                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                                title="View QR Code"
                                                aria-label="View QR Code for this link"
                                            >
                                                <QrCode className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedQr && (
                <QrModal
                    shortId={selectedQr}
                    isOpen={true}
                    onClose={() => setSelectedQr(null)}
                />
            )}
        </>
    );
}