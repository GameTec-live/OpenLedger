import {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
} from "@headlessui/react";
import { MenuIcon, XIcon } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { ModeToggle } from "./mode-toglle";
import { ProfileMenu } from "./profile-menu";

export default async function NavBar({ activeIndex }: { activeIndex: number }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    return (
        <Disclosure
            as="nav"
            className="relative bg-white shadow-sm dark:bg-gray-800/50 dark:shadow-none dark:after:pointer-events-none dark:after:absolute dark:after:inset-x-0 dark:after:bottom-0 dark:after:h-px dark:after:bg-white/10"
        >
            <div className="mx-auto px-2 sm:px-6 lg:px-8">
                <div className="relative flex h-16 justify-between">
                    <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                        {/* Mobile menu button */}
                        <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:ring-2 focus:ring-indigo-600 focus:outline-hidden focus:ring-inset dark:hover:bg-white/5 dark:hover:text-white dark:focus:ring-white">
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">Open main menu</span>
                            <MenuIcon
                                aria-hidden="true"
                                className="block size-6 group-data-open:hidden"
                            />
                            <XIcon
                                aria-hidden="true"
                                className="hidden size-6 group-data-open:block"
                            />
                        </DisclosureButton>
                    </div>
                    <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                        <div className="flex shrink-0 items-center">
                            <Image
                                alt="Your Company"
                                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                                className="h-8 w-auto dark:hidden"
                                width={32}
                                height={32}
                            />
                            <Image
                                alt="Your Company"
                                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                                className="h-8 w-auto not-dark:hidden"
                                width={32}
                                height={32}
                            />
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {/* Current: "border-indigo-600 dark:border-indigo-500 text-gray-900 dark:text-white", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:border-white/20 dark:hover:text-white" */}
                            <Link
                                href="/"
                                className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                                    activeIndex === 0
                                        ? "border-indigo-600 dark:border-indigo-500 text-gray-900 dark:text-white"
                                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:border-white/20 dark:hover:text-white"
                                }`}
                            >
                                Ledgers
                            </Link>
                            <Link
                                href="/projects"
                                className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                                    activeIndex === 1
                                        ? "border-indigo-600 dark:border-indigo-500 text-gray-900 dark:text-white"
                                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:border-white/20 dark:hover:text-white"
                                }`}
                            >
                                Projects
                            </Link>
                            {session && (
                                <>
                                    <Link
                                        href="/groups"
                                        className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                                            activeIndex === 2
                                                ? "border-indigo-600 dark:border-indigo-500 text-gray-900 dark:text-white"
                                                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:border-white/20 dark:hover:text-white"
                                        }`}
                                    >
                                        Groups
                                    </Link>
                                    <Link
                                        href="/person"
                                        className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                                            activeIndex === 3
                                                ? "border-indigo-600 dark:border-indigo-500 text-gray-900 dark:text-white"
                                                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:border-white/20 dark:hover:text-white"
                                        }`}
                                    >
                                        Person
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                        <ProfileMenu />
                        <ModeToggle />
                    </div>
                </div>
            </div>

            <DisclosurePanel className="sm:hidden">
                <div className="space-y-1 pt-2 pb-4">
                    {/* Current: "bg-indigo-50 dark:bg-indigo-600/10 border-indigo-600 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-600/10 dark:text-indigo-400", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-300 dark:hover:border-white/20 dark:hover:bg-white/5 dark:hover:text-white" */}
                    <DisclosureButton
                        as={Link}
                        href="/"
                        className={
                            activeIndex === 0
                                ? "bg-indigo-50 border-indigo-600 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-600/10 dark:text-indigo-400"
                                : "block border-l-4 border-transparent py-2 pr-4 pl-3 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-300 dark:hover:border-white/20 dark:hover:bg-white/5 dark:hover:text-white"
                        }
                    >
                        Ledgers
                    </DisclosureButton>
                    <DisclosureButton
                        as={Link}
                        href="/projects"
                        className={
                            activeIndex === 1
                                ? "bg-indigo-50 border-indigo-600 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-600/10 dark:text-indigo-400"
                                : "block border-l-4 border-transparent py-2 pr-4 pl-3 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-300 dark:hover:border-white/20 dark:hover:bg-white/5 dark:hover:text-white"
                        }
                    >
                        Projects
                    </DisclosureButton>
                </div>
            </DisclosurePanel>
        </Disclosure>
    );
}
