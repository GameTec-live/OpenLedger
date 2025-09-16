import { notFound } from "next/navigation";
import { ProjectmemberTable } from "@/components/projectmembers-table";
import { getProjectById } from "@/lib/db/queries/project";
import { getProjectParticipants } from "@/lib/db/queries/projectmember";

export default async function Page({
    params,
}: {
    params: Promise<{ projectid: string }>;
}) {
    const { projectid } = await params;
    const project = await getProjectById(projectid);
    const projectParticipants = await getProjectParticipants(projectid);

    if (!project || project.length === 0) {
        return notFound();
    }

    return (
        <main className="mx-4">
            <h1 className="text-2xl font-semibold mb-6 mt-4 text-center">
                {project[0].name}
            </h1>
            <ProjectmemberTable participants={projectParticipants} />
        </main>
    );
}
