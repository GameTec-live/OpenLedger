import NavBar from "@/components/nav-bar";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <NavBar activeIndex={2} />
            {children}
        </>
    );
}
