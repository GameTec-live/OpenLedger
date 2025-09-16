"use client";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";

export function ProfileMenu() {
    const { data: session, isPending, error } = authClient.useSession();

    const signOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    redirect("/login");
                },
            },
        });
    };

    if (isPending || error || !session) {
        return null;
    }

    return (
        <Menu as="div" className="relative mx-3">
            <MenuButton className="relative flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-500">
                <span className="absolute -inset-1.5" />
                <span className="sr-only">Open user menu</span>
                <Avatar className="size-8 rounded-full bg-gray-100 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10">
                    <AvatarImage
                        src={session.user.image || undefined}
                        alt={session.user.name}
                    />
                    <AvatarFallback className="rounded-full">
                        {session.user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            </MenuButton>

            <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg outline outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
            >
                <MenuItem>
                    <span className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                        {session.user.name}
                    </span>
                </MenuItem>
                <MenuItem>
                    <button
                        className="block px-4 w-full text-left py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5"
                        onClick={signOut}
                        type="button"
                    >
                        Sign out
                    </button>
                </MenuItem>
            </MenuItems>
        </Menu>
    );
}
