'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
	{ href: '/shipping', label: 'Shipping' },
	{ href: '/tracking', label: 'Tracking' },
	{ href: '/products', label: 'Products & Services' },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        return (
          <li key={link.href}>
            <Link
              className='text-black transition hover:text-gray-500'
              href={link.href}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </>
  )
}
