'use client';

import CheckBox from '@/app/components/CheckBox';
import PasswordInput from '@/app/components/PasswordInput';
import { useState } from 'react';
import { Slider } from '@mui/material';

function passwordStatisfiesCharsets(
  password: string,
  charsets: string[],
): boolean {
  let statisfiedCharsetsCount = 0;

  for (const charset of charsets) {
    for (const char of password) {
      if (charset.includes(char)) {
        statisfiedCharsetsCount += 1;
        break;
      }
    }
  }

  return statisfiedCharsetsCount === charsets.length;
}

const charsets = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  number: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>/?',
} as const;
type Charsets = typeof charsets;
type Charset = Charsets[keyof Charsets];

type CharsetIncluded = {
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
};

function getCharsets({
  numbers: numbers,
  symbols: symbols,
  uppercase: uppercase,
}: CharsetIncluded): Charset[] {
  const currentCharsets: Charset[] = [charsets.lowercase];
  if (uppercase) currentCharsets.push(charsets.uppercase);
  if (symbols) currentCharsets.push(charsets.symbols);
  if (numbers) currentCharsets.push(charsets.number);
  return currentCharsets;
}

function generateRandomPassword(
  charsetsIncluded: CharsetIncluded,
  length: number,
): string {
  const charsets = getCharsets(charsetsIncluded);

  if (length < charsets.length) {
    throw new Error(
      `Length (${length}) must be greater than the number of charsets (${charsets.length})`,
    );
  }

  const completeCharset = charsets.join('');
  let password = '';

  while (!passwordStatisfiesCharsets(password, charsets)) {
    password = '';

    for (let i = 0; i < length; i++) {
      password +=
        completeCharset[Math.floor(Math.random() * completeCharset.length)];
    }
  }

  return password;
}

const defaultLength = 8;
export default function PasswordGenerator() {
  const [length, setLength] = useState<number>(defaultLength);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  const password = generateRandomPassword(
    {
      numbers: includeNumbers,
      uppercase: includeUppercase,
      symbols: includeSymbols,
    },
    length as number,
  );

  return (
    <div className="m-4 flex flex-col items-center">
      <div>Password Generator</div>
      <PasswordInput password={password} disabled={true} />
      <div className="flex flex-col w-auto">
        <Slider
          style={{ width: 'auto' }}
          className="mx-4 my-2"
          name="Length"
          min={4}
          valueLabelDisplay="on"
          value={length}
          onChange={(_, val) => setLength(val as number)}
        />
        <CheckBox
          name="Include uppercase letters (A-Z)"
          checked={includeUppercase}
          onChange={() => setIncludeUppercase(!includeUppercase)}
        />
        <CheckBox
          name="Include numbers (0-9)"
          checked={includeNumbers}
          onChange={() => setIncludeNumbers(!includeNumbers)}
        />
        <CheckBox
          name="Include symbols (!@#...)"
          checked={includeSymbols}
          onChange={() => setIncludeSymbols(!includeSymbols)}
        />
      </div>
    </div>
  );
}
