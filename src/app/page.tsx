'use client';

import PasswordLeakChecker from '@/app/components/PasswordLeakChecker';
import PasswordGenerator from '@/app/components/PasswordGenerator';

export default function Home() {
  return (
    <div className="flex items-start">
      <PasswordLeakChecker />
      <PasswordGenerator />
    </div>
  )
}
