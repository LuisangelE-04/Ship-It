import Image from 'next/image';
import Link from 'next/link';
import NavLinks from '@/components/navigation/nav-links';
import { Menu } from 'lucide-react';

export default function Navbar() {

	return (
		<nav className='bg-white fixed w-full z-20 border-b'>
			<div className='mx-auto flex h-20 max-w-screen-xl items-center gap-8 px-4 sm:px-6 lg:px-8'>
				<Link className='block text-teal-600' href='/'>
					<span className='sr-only'>Home</span>
					<Image
            src='/images/logo.png'
            alt='Ship-It Logo'
            width={60}
            height={60}
            className='w-fit h-fit object-contain'
          />
				</Link>

				<div className='flex flex-1 items-center justify-end md:justify-between'>
					<nav aria-label='Global' className='hidden md:block'>
						<ul className='flex items-center gap-6 text-md'>
							<NavLinks />
						</ul>
					</nav>

					<div className='flex items-center gap-4'>
						<div className='sm:flex sm:gap-4'>
							<Link
								className='block rounded-md bg-sky-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sky-950'
								href='/login'
							>
								Login
							</Link>

							<Link
								className='hidden rounded-md bg-gray-100 px-5 py-2.5 text-sm font-medium text-sky-900 transition hover:text-sky-900/75 sm:block'
								href='/register'
							>
								Register
							</Link>
						</div>

						<button className='block rounded-sm bg-gary-100 p-2.5 text-gray-600 transition hover:text-gray-600/75 md:hidden'>
							<span className='sr-only'>Toggle menu</span>
							<Menu strokeWidth={2.25} />
						</button>
					</div>
				</div>
			</div>
		</nav>
	);
}
