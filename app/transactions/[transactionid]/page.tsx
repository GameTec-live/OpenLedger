import { Calendar, Folder, ReceiptText, User } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getTransactionById } from "@/lib/db/queries/transaction";

export default async function Page({
    params,
}: {
    params: Promise<{ transactionid: string }>;
}) {
    const { transactionid } = await params;

    const transaction = await getTransactionById(transactionid);

    if (!transaction) {
        return (
            <main className="mx-4">
                <Card>
                    <CardContent className="py-10 text-center text-muted-foreground">
                        Transaction not found
                    </CardContent>
                </Card>
            </main>
        );
    }

    const tx = transaction[0];

    const amountNum = Number(tx.amount);
    const isExpense = !Number.isNaN(amountNum) && amountNum < 0;
    const amountAbs = Math.abs(amountNum);

    const formatAmount = (n: number) => {
        try {
            return new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: "EUR",
            }).format(n);
        } catch {
            return n.toLocaleString();
        }
    };

    const createdAt = tx.createdAt;

    return (
        <main className="mx-4">
            <div className="mt-4 mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-semibold">
                    Transaction {transactionid}
                </h1>
                <div className="flex items-center gap-3">
                    <Link
                        href="/transactions"
                        className="text-sm text-muted-foreground hover:underline"
                    >
                        Back to transactions
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Amount
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-baseline justify-between">
                        <div className="text-3xl font-semibold">
                            {Number.isNaN(amountNum)
                                ? String(tx.amount)
                                : formatAmount(amountAbs)}
                        </div>
                        <Badge variant={isExpense ? "destructive" : "default"}>
                            {isExpense ? "Expense" : "Income"}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {tx.description ? (
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">
                                    Description
                                </div>
                                <p className="mt-1">{tx.description}</p>
                            </div>
                        ) : null}

                        <Separator />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex items-start gap-3">
                                <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        Correspondent
                                    </div>
                                    <div className="mt-1">
                                        {tx.correspondent || "—"}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Folder className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        Project
                                    </div>
                                    <Link href={`/projects/${tx.projectId}`}>
                                        {tx.projectName || "—"}
                                    </Link>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        Created
                                    </div>
                                    <div className="mt-1">
                                        {createdAt
                                            ? createdAt.toLocaleString()
                                            : "—"}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <ReceiptText className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div className="w-full">
                                    <div className="text-sm font-medium text-muted-foreground">
                                        Invoice
                                    </div>
                                    <div className="mt-1">
                                        {tx.invoiceURL ? (
                                            tx.invoiceURL.startsWith(
                                                "data:image",
                                            ) ? (
                                                <a
                                                    href={tx.invoiceURL}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <img
                                                        src={tx.invoiceURL}
                                                        alt="Invoice"
                                                        className="max-h-48 rounded-md border cursor-pointer hover:opacity-90"
                                                    />
                                                </a>
                                            ) : (
                                                <Link
                                                    href={tx.invoiceURL}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline break-all"
                                                >
                                                    View invoice
                                                </Link>
                                            )
                                        ) : (
                                            "—"
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <div className="text-sm font-medium text-muted-foreground">
                                Transaction ID
                            </div>
                            <code className="mt-1 inline-block rounded bg-muted px-2 py-1 text-sm">
                                {tx.id}
                            </code>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
