import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { getLedgers } from "@/lib/db/queries/ledger";

export default async function Home() {
    const ledgers = await getLedgers();
    return (
        <main className="mx-4">
            <h1 className="text-2xl font-semibold mb-6 text-center">Ledgers</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {ledgers.map((ledger) => (
                    <Link key={ledger.id} href={`/ledger/${ledger.id}`}>
                        <Card>
                            <CardHeader>
                                <CardTitle>{ledger.name}</CardTitle>
                                <CardDescription>
                                    {ledger.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-2xl">
                                {ledger.amount}€
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                by {ledger.ownerName} - {ledger.id}
                            </CardFooter>
                        </Card>
                    </Link>
                ))}
            </div>
        </main>
    );
}
