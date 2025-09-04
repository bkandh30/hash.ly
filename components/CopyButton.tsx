'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
    text: string;
    className?: string;
}

export default function CopyButton({ text, className = '' }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={`p-1.5 hover:bg-gray-100 rounded transition-colors ${className}`}
            title={copied ? "Copied!" : "Copy to clipboard"}
            aria-label={copied ? "Link copied to clipboard" : "Copy link to clipboard"}
            aria-live="polite"
        >
            {copied ? (
                <Check className="w-4 h-4 text-green-600" />
            ) : (
                <Copy className="w-4 h-4 text-gray-600" />
            )}
            <span className="sr-only">
                {copied ? "Copied successfully" : "Copy to clipboard"}
            </span>
        </button>
    );
}