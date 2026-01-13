export default function LegalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-card shadow-sm rounded-lg border border-gray-200 dark:border-gray-800 p-8 sm:p-12">
                <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h1:mb-8 prose-p:leading-relaxed prose-a:text-primary hover:prose-a:text-primary/80">
                    {children}
                </article>
            </div>
        </div>
    );
}
