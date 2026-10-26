import type React from 'react';

export default function TabItem({ children }: { value: string; children: React.ReactNode }) {
    return <div>{children}</div>;
}
