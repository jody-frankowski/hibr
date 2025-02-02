'use client';

import { useState } from 'react';
import { PasswordInput } from '@/app/components/PasswordInput';


export default function Home() {
  const [password, setPassword] = useState('');
  const [matches, setMatches] = useState<boolean | null>(null)

  const onPasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    const res = fetch('/api/v1/rockyou?' + new URLSearchParams({password: newPassword}))
      .then((res) => {
        if (res.status === 200)
          setMatches(true)
        else
          setMatches(false)
      })
  }

  return (
    <div
      className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <PasswordInput password={password} onInput={onPasswordInput} />
      <div>{matches ? "😬" : "👍"}</div>
    </div>
  )
}
