'use client';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t bg-card/30 backdrop-blur-sm mt-auto">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground whitespace-nowrap">
                        <span>© {currentYear} Hash.ly</span>
                        <span className="mx-2">|</span>
                        <span>
                            Built with Next.js, Turso, Drizzle, React, TypeScript and TailwindCSS.
                        </span>
                        <span className="mx-2">|</span>
                        <span>
                            Developed by{' '}
                            <a
                                href="https://github.com/bkandh30/hash.ly"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-600 hover:underline"
                            >
                                Bhavya Kandhari
                            </a>
                        </span>
                    </p>
                </div>
            </div>
        </footer>
    );
}