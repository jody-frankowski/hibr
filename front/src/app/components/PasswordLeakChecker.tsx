'use client';

import { useState } from 'react';
import { xxhash128 } from 'hash-wasm';
import { Alert } from '@heroui/alert';
import { Input } from '@heroui/input';

// Not exported by the module
type alertColor = 'default' | 'success' | 'danger' | 'warning' | 'primary' | 'secondary' | undefined;

type matchStatus = '' | '❌' | '😬' | '👍';

// Top 100 passwords in RockYou according to the more realistic SecLists by OWASP
// https://github.com/danielmiessler/SecLists/blob/fc9cbdfe8f8e5ae0505cd781f6a243239ddddd3f/Passwords/Common-Credentials/10-million-password-list-top-10000.txt#L1
const rockYouTop100 = [
  '123456',
  'password',
  '12345678',
  'qwerty',
  '123456789',
  '12345',
  '1234',
  '111111',
  '1234567',
  'dragon',
  '123123',
  'baseball',
  'abc123',
  'football',
  'monkey',
  'letmein',
  '696969',
  'shadow',
  'master',
  '666666',
  'qwertyuiop',
  '123321',
  'mustang',
  '1234567890',
  'michael',
  '654321',
  'pussy',
  'superman',
  '1qaz2wsx',
  '7777777',
  'fuckyou',
  '121212',
  '000000',
  'qazwsx',
  '123qwe',
  'killer',
  'trustno1',
  'jordan',
  'jennifer',
  'zxcvbnm',
  'asdfgh',
  'hunter',
  'buster',
  'soccer',
  'harley',
  'batman',
  'andrew',
  'tigger',
  'sunshine',
  'iloveyou',
  'fuckme',
  '2000',
  'charlie',
  'robert',
  'thomas',
  'hockey',
  'ranger',
  'daniel',
  'starwars',
  'klaster',
  '112233',
  'george',
  'asshole',
  'computer',
  'michelle',
  'jessica',
  'pepper',
  '1111',
  'zxcvbn',
  '555555',
  '11111111',
  '131313',
  'freedom',
  '777777',
  'pass',
  'fuck',
  'maggie',
  '159753',
  'aaaaaa',
  'ginger',
  'princess',
  'joshua',
  'cheese',
  'amanda',
  'summer',
  'love',
  'ashley',
  '6969',
  'nicole',
  'chelsea',
  'biteme',
  'matthew',
  'access',
  'yankees',
  '987654321',
  'dallas',
  'austin',
  'thunder',
  'taylor',
  'matrix',
];

export default function PasswordLeakChecker() {
  const [password, setPassword] = useState('');
  const [matchStatus, setMatchStatus] = useState<matchStatus>('');
  const alertMessages = {
    '': '',
    '👍': '👍 Password not found (yet)',
    '😬': '😬 Password has leaked',
    '❌': '❌ Failed to contact server',
  };
  const alertColors = {
    '': 'default',
    '👍': 'success',
    '😬': 'danger',
    '❌': 'warning',
  }

  const onPasswordChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (newPassword === '') {
      setMatchStatus('');
      return;
    }

    if (rockYouTop100.includes(newPassword)) {
      console.log(`rockYouTop100 hit: ${newPassword}`);
      setMatchStatus('😬');
      return;
    }

    try {
      const hashedPassword = await xxhash128(newPassword);
      console.log(`Hash(${newPassword})=${hashedPassword}`);

      const res = await fetch(
        `api/v1/prefix/${encodeURIComponent(hashedPassword).slice(0, 4)}`,
      );
      if (res.status === 200) {
        const hashes = await res.json();
        if (hashes.includes(hashedPassword)) {
          setMatchStatus('😬');
        } else {
          setMatchStatus('👍');
        }
      } else {
        setMatchStatus('❌');
      }
    } catch (e) {
      console.error('Failed to fetch password information:', e);
      setMatchStatus('❌');
    }
  };

  return (
    <div className="flex flex-col items-center m-4 gap-4 min-w-96">
      <div>Password Leak Checker</div>
      <Input placeholder="Password" value={password} onValueChange={setPassword} onChange={onPasswordChange} variant="bordered" size="lg" />
      <Alert color={alertColors[matchStatus] as alertColor} style={{ visibility: matchStatus === '' ? 'hidden' : 'visible' }} className="w-auto">
        {alertMessages[matchStatus]}
      </Alert>
    </div>
  );
}
