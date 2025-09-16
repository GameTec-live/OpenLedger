export default async function Page({
    params,
}: {
    params: Promise<{ groupid: string }>;
}) {
    const { groupid } = await params;

    return (
        <main className="mx-4">
            <h1 className="text-2xl font-semibold mb-6 mt-4 text-center">
                Group {groupid}
            </h1>
        </main>
    );
}
