'use client';

import CheckBox from '@/app/components/CheckBox';
import PasswordInput from '@/app/components/PasswordInput';
import { useEffect, useState } from 'react';
// import { Slider, SliderValue } from '@heroui/react';
import { Slider } from '@mui/material';

function passwordStatisfiesCharsets(password: string, charsets: string[]): boolean {
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

function generateRandomPassword(charsets: string[], length: number): string {
  if (length < charsets.length) {
    throw new Error(`Length (${length}) must be greater than the number of charsets (${charsets.length})`);
  }

  const completeCharset = charsets.join('');
  let password = '';

  while (!passwordStatisfiesCharsets(password, charsets)) {
    password = '';

    for (let i = 0; i < length; i++) {
      password += completeCharset[Math.floor(Math.random() * completeCharset.length)];
    }
  }

  return password;
}

export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState<number>(8);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  let charsets = [
    'abcdefghijklmnopqrstuvwxyz'
  ];
  if (includeUppercase) {
    charsets.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  }
  if (includeNumbers) {
    charsets.push('0123456789');
  }
  if (includeSymbols) {
    charsets.push('!@#$%^&*()_+-=[]{}|;:,.<>/?');
  }

  if (length < charsets.length) {
    setLength(charsets.length);
    return;
  }

  useEffect(() => {
    if (length < charsets.length) {
      setLength(charsets.length);
    }
    // const password = generateRandomPassword(charsets, length as number);
    setPassword(generateRandomPassword(charsets, length as number));
  }, [length, charsets.length]);


  return (
    <div className="m-4 flex flex-col items-center">
      <PasswordInput password={password} disabled={true} onChange={() => {
      }} />
      <div className="flex flex-col w-auto">
        {/*<Slider className="max-w-xl" name="Length" maxValue={128} formatOptions={{ style: "decimal" }} value={length} onChange={setLength} style={{ clipPath: 'none', overflow: 'visible', position: 'relative' }} />*/}
        <Slider style={{ width: 'auto' }} className="mx-4 my-2" name="Length" min={charsets.length}
                valueLabelDisplay="on" value={length}
                onChange={(_, val) => setLength(val as number)} />
        <CheckBox name="Include uppercase letters (A-Z)" checked={includeUppercase}
                  onChange={() => setIncludeUppercase(!includeUppercase)} />
        <CheckBox name="Include numbers (0-9)" checked={includeNumbers}
                  onChange={() => setIncludeNumbers(!includeNumbers)} />
        <CheckBox name="Include symbols (!@#...)" checked={includeSymbols}
                  onChange={() => setIncludeSymbols(!includeSymbols)} />
      </div>
    </div>
  );
}
