'use client';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t bg-background mt-auto">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col items-center gap-2 text-center">
                    {/* Copyright */}
                    <p className="text-xs text-muted-foreground">
                        © {currentYear} <span className="font-medium">Hash.ly</span>
                    </p>

                    {/* Tech Stack */}
                    <p className="text-xs text-muted-foreground">
                        Built with Next.js, Turso, Drizzle, React, TypeScript, TailwindCSS
                    </p>

                    {/* Developer Credit */}
                    <p className="text-xs text-muted-foreground">
                        Developed by{" "}
                        <a
                            href="https://github.com/bkandh30/hash.ly"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:underline"
                        >
                            Bhavya Kandhari
                        </a>
                    </p>

                    {/* Social Links (small + muted) */}
                    <div className="flex gap-4 mt-1">
                        <a
                            href="https://github.com/bkandh30"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                className="w-4 h-4"
                            >
                                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2.1c-3.2.7-3.9-1.5-3.9-1.5-.5-1.2-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1.6 1.6 2.6 2.2.2-.7.4-1.2.7-1.5-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.2 0 4.5-2.7 5.5-5.3 5.8.4.3.7.9.7 1.8v2.7c0 .3.2.7.8.6A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
                            </svg>
                        </a>
                        <a
                            href="https://www.linkedin.com/in/kandharibhavya/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-blue-600 transition-colors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                className="w-4 h-4"
                            >
                                <path d="M19 0h-14c-2.8 0-5 2.2-5 5v14c0 2.8 2.2 5 5 5h14c2.8 0 5-2.2 5-5v-14c0-2.8-2.2-5-5-5zm-11 20h-3v-11h3v11zm-1.5-12.3c-1 0-1.7-.8-1.7-1.7s.8-1.7 1.7-1.7c1 0 1.7.8 1.7 1.7s-.7 1.7-1.7 1.7zm13.5 12.3h-3v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7h-3v-11h2.9v1.5h.1c.4-.7 1.4-1.5 2.9-1.5 3.1 0 3.7 2 3.7 4.6v6.4z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}