'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import NavLinks from '@/components/navigation/nav-links';

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className='md:hidden p-2.5 rounded-md text-gray-600 transition hover:text-gray-700 hover:bg-gray-100'
        aria-label='Toggle menu'
        aria-expanded={open}
      >
        {open ? <X strokeWidth={2.25} /> : <Menu strokeWidth={2.25} />}
      </button>

      <div 
        className={`
          absolute left-0 right-0 top-20 z-20 md:hidden bg-white px-4 pb-4 shadow-md 
          transform transition-all duration-300 ease-in-out
          ${open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none invisible'}
        `}
      >
        <ul className='flex flex-col gap-2 pt-3 text-sm'>
          <NavLinks />
          <li className='pt-2'>
            <Link
              href='/login'
              onClick={() => setOpen(false)}
              className='block rounded-md bg-sky-900 px-4 py-2 text-center font-medium text-white'
            >
              Login
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}