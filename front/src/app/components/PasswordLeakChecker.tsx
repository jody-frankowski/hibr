'use client';

import { useEffect, useRef, useState } from 'react';
import { xxhash128 } from 'hash-wasm';
import { Alert } from '@heroui/alert';
import { Button } from '@heroui/button';
import { InfoIcon } from '@heroui/shared-icons';
import { Input } from '@heroui/input';
import { Link } from '@heroui/link';
import { Tooltip } from '@heroui/tooltip';

// Not exported by the module
type alertColor =
  'default'
  | 'success'
  | 'danger'
  | 'warning'
  | 'primary'
  | 'secondary'
  | undefined;

type matchStatus = 'MatchInit' | 'MatchServerError' | 'MatchFound' | 'MatchNotFound';

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
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const isTooltipOpenRef = useRef(isTooltipOpen);
  useEffect(() => {
    isTooltipOpenRef.current = isTooltipOpen;
  }, [isTooltipOpen]);

  const [password, setPassword] = useState('');
  const [matchStatus, setMatchStatus] = useState<matchStatus>('MatchInit');
  const alertMessages: Record<matchStatus, string> = {
    'MatchInit': '',
    'MatchNotFound': '👍 Password not found (yet)',
    'MatchFound': '😬 Password has leaked',
    'MatchServerError': '❌ Failed to contact server',
  };
  const alertColors: Record<matchStatus, string> = {
    'MatchInit': 'default',
    'MatchNotFound': 'success',
    'MatchFound': 'danger',
    'MatchServerError': 'warning',
  };

  const onPasswordChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (newPassword === '') {
      setMatchStatus('MatchInit');
      return;
    }

    if (rockYouTop100.includes(newPassword)) {
      console.log(`rockYouTop100 hit: ${newPassword}`);
      setMatchStatus('MatchFound');
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
          setMatchStatus('MatchFound');
        } else {
          setMatchStatus('MatchNotFound');
        }
      } else {
        setMatchStatus('MatchServerError');
      }
    } catch (e) {
      console.error('Failed to fetch password information:', e);
      setMatchStatus('MatchServerError');
    }
  };

  return (
    <div className="flex flex-col items-center m-4 gap-4 min-w-96">
      <div className="flex items-center gap-4">
        <div>Password Leak Checker</div>
        <Tooltip content={
          <div>
            <Link isExternal underline="hover"
                  href="https://en.wikipedia.org/wiki/K-anonymity">Anonymously</Link> check if your
            password has leaked in the <Link isExternal underline="hover"
                                             href="https://en.wikipedia.org/wiki/RockYou#Data_breach">
            RockYou leak
          </Link>
          </div>
        }
                 isOpen={isTooltipOpen}
        >
          <Button
            title="Informations" isIconOnly variant="light" color="primary" size="lg"
            onPress={() => {
              setIsTooltipOpen(!isTooltipOpen);
              setTimeout(() => {
                if (!isTooltipOpen) {
                  document.addEventListener('click', () => {
                    if (isTooltipOpenRef.current) {
                      setIsTooltipOpen(false);
                    }
                  }, { once: true });
                }
              }, 10);
            }}
            className="h-auto w-auto min-h-auto min-w-1 hover:!bg-transparent"
          >
            <InfoIcon height="1.25rem" width="1.25rem" />
          </Button>
        </Tooltip>
      </div>
      <Input placeholder="Password" value={password} onValueChange={setPassword}
             onChange={onPasswordChange} variant="bordered" size="lg" />
      <Alert color={alertColors[matchStatus] as alertColor}
             style={{ visibility: matchStatus === 'MatchInit' ? 'hidden' : 'visible' }}
             className="w-auto">
        {alertMessages[matchStatus]}
      </Alert>
    </div>
  );
}
