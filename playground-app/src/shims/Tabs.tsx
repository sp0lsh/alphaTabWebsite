import React, { useState } from 'react';

type TabsProps = {
    defaultValue: string;
    values: { label: string; value: string }[];
    children: React.ReactNode;
};

export default function Tabs({ defaultValue, values, children }: TabsProps) {
    const [active, setActive] = useState(defaultValue);
    return (
        <div>
            <ul className="tabs">
                {values.map(v => (
                    <li
                        key={v.value}
                        className={`tabs__item ${v.value === active ? 'tabs__item--active' : ''}`}
                        onClick={() => setActive(v.value)}>
                        {v.label}
                    </li>
                ))}
            </ul>
            {React.Children.toArray(children).filter(
                c => React.isValidElement<{ value: string }>(c) && c.props.value === active
            )}
        </div>
    );
}
