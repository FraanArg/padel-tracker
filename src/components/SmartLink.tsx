'use client';

import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface SmartLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>, LinkProps {
    children: ReactNode;
}

export default function SmartLink({ children, href, ...props }: SmartLinkProps) {
    const router = useRouter();

    const prefetch = () => {
        if (typeof href === 'string') {
            router.prefetch(href);
        }
    };

    return (
        <Link
            href={href}
            {...props}
            onTouchStart={prefetch}
            onMouseEnter={prefetch}
        >
            {children}
        </Link>
    );
}
