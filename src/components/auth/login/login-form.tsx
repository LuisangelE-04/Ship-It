'use client';

import { User, LockKeyhole, CircleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from '@heroicons/react/16/solid';

export default function LoginForm() {

  return (
    <form className='space-y-3'>
      <div className='flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8'>
        <div className='max-w-sm space-y-3'>
          <div className='relative'>
            <input 
              type='email' 
              className='peer py-2.5 sm:py-3 px-4 ps-11 block w-full bg-gray-100 border-transparent rounded-lg sm:text-sm placeholder:text-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition' placeholder='Email'
              id='email'
              required
              />
            <div className='absolute inset-y-0 start-0 flex items-center pointer-events-none ps-4 peer-disabled:opacity-50 peer-disabled:pointer-events-none'>
              <User className='size-4 text-sky-800 shrink-0' />
            </div>
          </div>

          <div className='relative'>
            <input 
              type='password' 
              className='peer py-2.5 sm:py-3 px-4 ps-11 block w-full bg-gray-100 border-transparent rounded-lg sm:text-sm placeholder:text-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition' placeholder='Password'
              id='email'
              required
              />
            <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-4">
              <LockKeyhole className='size-4 text-sky-800 shrink-0' size={16} />
            </div>
          </div>
        </div>
        <input type='hidden' />
        <Button className='mt-4 w-full'>
          Login <ArrowRightIcon className='ml-auto h-5 w-5' />
        </Button>
        <div className='flex h-8 items-end space-x-1'>
          <>
            <CircleAlert className='h-5 w-5 text-red-500' />
            <p className='text-sm text-red-500'>Show error message here</p>
          </>
        </div>
      </div>
    </form>
  )
}
