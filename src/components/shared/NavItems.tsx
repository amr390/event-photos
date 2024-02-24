'use client';
import { headerLinks } from '@/constants';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { SignedIn, auth } from '@clerk/nextjs';
import { createUser, updateUser } from '@/lib/actions/user.actions';

function NavItems() {
  const pathname = usePathname();
  const { user } = auth();
  const handleWebhook = async (action: string) => {
    if (user) {
      if (action === 'create') {
        createUser({
          providerId: user.id,
          firstName: user.firstName!,
          lastName: user.lastName!,
          email: user.emailAddresses[0].emailAddress,
          image: user.imageUrl,
        });
      } else {
        updateUser({
          userId: user.id,
          username: user.username!,
          name: user.firstName!,
          image: user?.imageUrl,
          path: pathname,
        });
      }
    }
  };

  return (
    <ul className="md:flex-between flex w-full flex-col items-start gap-5 md:flex-row">
      <SignedIn>
        <li className="text-primary-500 flex-center p-medium-16 whitespace-nowrap">
          <Button onClick={() => handleWebhook('create')} asChild={true}>
            Simulate Create webhook
          </Button>
        </li>
        <li className="text-primary-500 flex-center p-medium-16 whitespace-nowrap">
          <Button onClick={() => handleWebhook('update')} asChild={true}>
            Simulate Update webhook
          </Button>
        </li>
      </SignedIn>

      {headerLinks.map((link) => {
        const isActive = pathname === link.route;
        return (
          <li
            key={link.route}
            className={`${
              isActive && 'text-primary-500'
            } flex-center p-medium-16 whitespace-nowrap`}
          >
            <Link href={link.route}>{link.label}</Link>
          </li>
        );
      })}
    </ul>
  );
}

export default NavItems;
