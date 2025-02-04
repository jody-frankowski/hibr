'use client'

interface PasswordInputProps {
  children?: React.ReactNode;
  password: string;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PasswordInput({ children, password, disabled, onChange }: PasswordInputProps) {
  return (
    <div className="m-4 p-4 flex justify-between items-center rounded-md border-2">
      <input
        className="w-full bg-transparent text-2xl font-bold outline-none placeholder:opacity-75"
        placeholder="Password"
        disabled={disabled === true ? true : false}
        value={password}
        data-testid='password-input-input'
        onChange={(e) => onChange(e)}
      />
      <div>{children}</div>
    </div>
  )
}
