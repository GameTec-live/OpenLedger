export default async function Page({
    params,
}: {
    params: Promise<{ personid: string }>;
}) {
    const { personid } = await params;

    return (
        <main className="mx-4">
            <h1 className="text-2xl font-semibold mb-6 mt-4 text-center">
                Person {personid}
            </h1>
        </main>
    );
}
