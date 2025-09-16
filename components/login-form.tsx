"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Checkbox } from "./ui/checkbox";

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const password = useRef<HTMLInputElement>(null);
    const email = useRef<HTMLInputElement>(null);
    const rememberMe = useRef<HTMLButtonElement>(null);

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const signInEmail = async () => {
        if (!email.current || !password.current) {
            return;
        }

        await authClient.signIn.email(
            {
                email: email.current.value,
                password: password.current.value,
                callbackURL: "/dashboard",
                rememberMe: rememberMe.current?.value
                    ? rememberMe.current.value === "on"
                    : true,
            },
            {
                onRequest: () => {
                    setLoading(true);
                },
                onSuccess: () => {
                    setLoading(false);
                },
                onError: (ctx) => {
                    setError(ctx.error.message);
                },
            },
        );
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Login to your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Enter your email below to login to your account
                </p>
            </div>
            <div className="grid gap-6">
                <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        type="email"
                        placeholder="m@example.com"
                        required
                        ref={email}
                    />
                </div>
                <div className="grid gap-3">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        {/* <a
                            href="#"
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                            Forgot your password?
                        </a> */}
                    </div>
                    <Input type="password" required ref={password} />
                </div>
                <div className="grid gap-3">
                    <div className="flex items-center gap-2">
                        <Checkbox ref={rememberMe} defaultChecked />
                        <Label htmlFor="remember-me">Remember me</Label>
                    </div>
                </div>
                {error && (
                    <div className="text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}
                <Button
                    className="w-full"
                    onClick={signInEmail}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Login"}
                </Button>
            </div>
        </div>
    );
}
