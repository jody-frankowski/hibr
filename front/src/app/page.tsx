import PasswordLeakChecker from '@/app/components/PasswordLeakChecker';
import PasswordGenerator from '@/app/components/PasswordGenerator';
import { ThemeSwitcher } from '@/app/components/ThemeSwitcher';

export default function Home() {
  return (
    <div className="flex flex-wrap items-start justify-center">
      <PasswordLeakChecker />
      <PasswordGenerator />
      <div className="fixed bottom-10 right-10">
        <ThemeSwitcher/>
      </div>
    </div>
  );
}
