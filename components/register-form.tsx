"use client";
import { redirect } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function RegisterForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const password = useRef<HTMLInputElement>(null);
    const email = useRef<HTMLInputElement>(null);
    const confirmPassword = useRef<HTMLInputElement>(null);
    const name = useRef<HTMLInputElement>(null);

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const signUpEmail = async () => {
        if (
            !email.current ||
            !password.current ||
            !confirmPassword.current ||
            !name.current
        ) {
            return;
        }

        if (password.current.value !== confirmPassword.current.value) {
            setError("Passwords do not match");
            return;
        }

        await authClient.signUp.email(
            {
                email: email.current.value,
                password: password.current.value,
                name: name.current.value,
                callbackURL: "/dashboard",
            },
            {
                onRequest: () => {
                    setLoading(true);
                },
                onSuccess: () => {
                    setLoading(false);
                    redirect("/login");
                },
                onError: (ctx) => {
                    setError(ctx.error.message);
                    setLoading(false);
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
                    <Label htmlFor="email">Username</Label>
                    <Input
                        type="text"
                        placeholder="Enter your username"
                        required
                        ref={name}
                    />
                </div>
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
                    </div>
                    <Input type="password" required ref={password} />
                </div>
                <div className="grid gap-3">
                    <div className="flex items-center">
                        <Label htmlFor="confirm-password">
                            Confirm Password
                        </Label>
                    </div>
                    <Input type="password" required ref={confirmPassword} />
                </div>
                {error && (
                    <div className="text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}
                <Button
                    className="w-full"
                    onClick={signUpEmail}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Sign Up"}
                </Button>
            </div>
        </div>
    );
}
