'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [signed, setSigned] = useState(true);
  const pathname = usePathname();
  
  const isRoot = pathname === '/';

  return (
    <div className="fixed w-full h-16 bg-white dark:bg-black border-b-2 border-amber-700/20 backdrop-blur-2xl px-12 md:px-56 z-50">
      <div className="w-full h-full flex flex-row items-center justify-between">
        <a href='/'>
          <span className="text-black dark:text-white font-semibold">Nenasala</span>{" "}
          <span className="text-amber-600 font-semibold">Peradeniya</span>
        </a>
        <div className="flex flex-row items-center gap-4">
          <ThemeToggle />
          
          {isRoot && signed && (
            <Link href="/admin" className="h-9 px-4 flex items-center justify-center button-color bg-amber-600 text-white rounded-full hover:scale-105 transition-all cursor-pointer text-sm font-medium">
              Dashboard
            </Link>
          )}

          {signed && (
            <div className="bg-black w-8.5 h-8.5 rounded-full overflow-hidden cursor-pointer">
              <img src="https://images.unsplash.com/photo-1654110455429-cf322b40a906?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="profile" className="w-full h-full object-cover" />
            </div>
          )}

          {!isRoot && !signed && (
            <Link href="/signin" className="h-9 px-5 flex items-center justify-center bg-amber-600 text-white rounded-full hover:scale-105 transition-all cursor-pointer text-sm font-medium">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}