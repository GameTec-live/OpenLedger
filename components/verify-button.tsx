"use client";

import { verifyLedgerBalance } from "@/lib/server/verify";
import { Button } from "./ui/button";

export function VerifyButton({ ledgerId }: { ledgerId: string }) {
    async function verify() {
        await verifyLedgerBalance(ledgerId).then((result) => {
            alert(`Verification result: ${result}`);
        });
    }

    return <Button onClick={verify}>Verify Balance</Button>;
}
