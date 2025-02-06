interface CheckBoxProps {
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CheckBox({ name, checked, onChange }: CheckBoxProps) {
  return (
    <div className="flex items-center m-4">
      <input
        id={name}
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
      />
      <label className="ml-2" htmlFor={name}>
        {name}
      </label>
    </div>
  );
}
