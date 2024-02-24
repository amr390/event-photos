'use client';
import { SignedIn, SignedOut, UserButton, useAuth } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import NavItems from './NavItems';
import MobileNav from './MobileNav';
import { Button } from '../ui/button';
import { simulateWebHook } from '@/lib/actions/user.actions';

function Header() {
  const { isLoaded, userId } = useAuth();

  const handleWebhook = async (action: string) => {
    if (isLoaded && userId) {
      simulateWebHook({ action });
    }
  };

  return (
    <header className="w-full border-b">
      <div className="wrapper flex items-center justify-between">
        <Link href="/" className="w-36">
          <Image
            src="/assets/images/logo.svg"
            width={128}
            height={38}
            alt="Events Logo"
          />
        </Link>
        <SignedIn>
          <nav className="md:flex-between hidden w-full max-w-xs">
            <NavItems />
          </nav>
        </SignedIn>
        <div className="flex w-32 justify-end gap-3">
          <SignedIn>
            <ul className="flex flex-row flex-grow gap-3 flex-1">
              <li className="text-primary-500 flex-center p-medium-16 whitespace-nowrap">
                <Button
                  aria-placeholder="simulate create user webhook"
                  title="simulate create user webhook"
                  onClick={() => handleWebhook('create')}
                >
                  {/*Sewin Ping*/}
                  {SewinPingIcon()}
                </Button>
              </li>
              <li className="text-primary-500 flex-center p-medium-16 whitespace-nowrap">
                <Button
                  aria-placeholder="simulate update user webhook"
                  title="simulate update user webhook"
                  onClick={() => handleWebhook('update')}
                >
                  {/*Sewin Ping filled */}
                  {SewinPingFilledIcon()}
                </Button>
              </li>
            </ul>

            <UserButton afterSignOutUrl="/" />
            <MobileNav />
          </SignedIn>
          <SignedOut>
            <Button asChild className="rounded-full" size="lg">
              <Link href="/sign-in">Login</Link>
            </Button>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}

const SewinPingIcon = () => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 3.5C6 2.67157 6.67157 2 7.5 2C8.32843 2 9 2.67157 9 3.5C9 4.32843 8.32843 5 7.5 5C6.67157 5 6 4.32843 6 3.5ZM8 5.94999C9.14112 5.71836 10 4.70948 10 3.5C10 2.11929 8.88071 1 7.5 1C6.11929 1 5 2.11929 5 3.5C5 4.70948 5.85888 5.71836 7 5.94999V13.5C7 13.7761 7.22386 14 7.5 14C7.77614 14 8 13.7761 8 13.5V5.94999Z"
        fill="currentColor"
        fill-rule="evenodd"
        clip-rule="evenodd"
      ></path>
    </svg>
  );
};

const SewinPingFilledIcon = () => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 3.5C10 4.70948 9.14112 5.71836 8 5.94999V13.5C8 13.7761 7.77614 14 7.5 14C7.22386 14 7 13.7761 7 13.5V5.94999C5.85888 5.71836 5 4.70948 5 3.5C5 2.11929 6.11929 1 7.5 1C8.88071 1 10 2.11929 10 3.5Z"
        fill="currentColor"
        fill-rule="evenodd"
        clip-rule="evenodd"
      ></path>
    </svg>
  );
};
export default Header;
