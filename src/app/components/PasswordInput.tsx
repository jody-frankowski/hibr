'use client'

interface PasswordInputProps {
  password: string;
  onInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PasswordInput({ password, onInput }: PasswordInputProps) {
  return (
    <div className="mt-4 p-2 flex justify-between items-center bg-dark-grey md:mt-8 md:py-5 md:px-8 rounded-md border-2">
      <input
        className="w-full bg-transparent outline-none text-2xl text-almost-white font-bold placeholder:opacity-25 md:text-[32px]"
        placeholder="Password"
        value={password}
        data-testid='password-input-input'
        onChange={(e) => onInput(e)}
      />
    </div>
  )
}
