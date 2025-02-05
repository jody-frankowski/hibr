'use client';

import { useState } from 'react';
import PasswordInput from '@/app/components/PasswordInput';
import { blake2b } from 'hash-wasm';
import { Alert } from '@mui/material';

type matchStatus = '' | '❌' | '😬' | '👍'

export default function PasswordLeakChecker() {
  const [password, setPassword] = useState('');
  const [matchStatus, setMatchStatus] = useState<matchStatus>('');

  const onPasswordChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (newPassword === '') {
      setMatchStatus('');
      return;
    }

    try {
      const hashedPassword = await blake2b(newPassword, 256);
      console.log(`Hash(${newPassword})=${hashedPassword}`);

      const res = await fetch(
        `api/v1/prefix/${encodeURIComponent(hashedPassword).slice(0, 4)}`
      );
      if (res.status === 200) {
        const hashes = await res.json()
        if (hashes.includes(hashedPassword)) {
          setMatchStatus('😬');
        } else {
          setMatchStatus('👍')
        }
      } else {
        setMatchStatus('❌');
      }
    } catch (e) {
      console.error('Failed to fetch password information:', e);
      setMatchStatus('❌');
    }
  };

  let alertMessage;
  if (matchStatus === '❌') {
    alertMessage = (
      <Alert severity="warning">Could not contact the server</Alert>
    );
  } else {
    alertMessage = null;
  }

  return (
    <div className="m-4 flex flex-col items-center">
      <PasswordInput password={password} onChange={onPasswordChange}>
        <div>{matchStatus}</div>
      </PasswordInput>
      {alertMessage}
    </div>
  );
}
