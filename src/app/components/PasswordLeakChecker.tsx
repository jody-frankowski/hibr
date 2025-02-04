'use client';

import { useState } from 'react';
import PasswordInput from '@/app/components/PasswordInput';
import { blake2b } from 'hash-wasm';
import { Alert } from '@mui/material';

type matchStatus = "" | "❌" | "😬" | "👍"

export default function PasswordLeakChecker() {
  const [password, setPassword] = useState('');
  const [matchStatus, setMatchStatus] = useState<matchStatus>("")

  const onPasswordChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (newPassword === '') {
      setMatchStatus('')
      return;
    }

    console.log(blake2b(newPassword, 256).then(console.log));
    try {
      const hashedPassword = await blake2b(newPassword, 256);
      const res = fetch(
        'api/v1/rockyou?' + new URLSearchParams({password: hashedPassword})
      )
        .then((res) => {
          if (res.status === 200) {
            setMatchStatus('😬')
          } else if (res.status === 404) {
            setMatchStatus('👍')
          } else {
            setMatchStatus('❌')
          }
        })
    } catch (e) {
      console.error(e);
      setMatchStatus("❌")
    }
  }

  let alertMessage;
  if (matchStatus === '❌') {
    alertMessage = (
      <Alert severity="warning">Could not contact the server</Alert>
    )
  } else {
    alertMessage = null
  }

  return (
    <div className="m-4 flex flex-col items-center">
      <PasswordInput password={password} onChange={onPasswordChange}>
        <div>{matchStatus}</div>
      </PasswordInput>
      {alertMessage}
    </div>
  )
}
