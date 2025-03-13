'use client';

import { useEffect, useState } from 'react';
import { Checkbox } from '@heroui/checkbox';
import { Slider, SliderValue } from '@heroui/slider';
import { Snippet } from '@heroui/snippet';

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

export default function PasswordGenerator() {
  const [length, setLength] = useState<number>(8);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  // We set the password to an empty initial value in order to avoid hydration errors
  const [password, setPassword] = useState<string>('');

  useEffect(() => {
    const newPassword = generateRandomPassword(
      {
        numbers: includeNumbers,
        uppercase: includeUppercase,
        symbols: includeSymbols,
      },
      length as number,
    );
    setPassword(newPassword);
  }, [length, includeNumbers, includeUppercase, includeSymbols]);

  const sliderColor = length >= 8 ? 'primary' : 'danger';

  return (
    <div className="flex flex-col items-center m-4 gap-4 min-w-96">
      <div>Password Generator</div>
      <Snippet symbol="" className="w-full select-all">{password}</Snippet>
      <div className="flex flex-col w-full gap-4">
        <Checkbox isSelected={includeUppercase} onValueChange={setIncludeUppercase} >
        <Slider label="Length" value={length} color={sliderColor} onChange={setLength as (value: SliderValue) => void} minValue={4} maxValue={32} step={1} size="sm" showTooltip/>
          Include uppercase letters (A-Z)
        </Checkbox>
        <Checkbox isSelected={includeNumbers} onValueChange={setIncludeNumbers} >
          Include numbers (0-9)
        </Checkbox>
        <Checkbox isSelected={includeSymbols} onValueChange={setIncludeSymbols} >
          Include symbols (!@#...)
        </Checkbox>
      </div>
    </div>
  );
}
