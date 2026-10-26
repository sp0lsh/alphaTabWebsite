import type React from 'react';

export default function CodeBlock({ title, children }: { language?: string; title?: string; children: React.ReactNode }) {
    return (
        <div>
            {title && <strong>{title}</strong>}
            <pre>
                <code>{children}</code>
            </pre>
        </div>
    );
}
