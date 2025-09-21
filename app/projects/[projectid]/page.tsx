import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ConfirmCompleteButton } from "@/components/confirm-complete-button";
import { CreatePayoutDialog } from "@/components/payout-dialog";
import { EditProjectDialog } from "@/components/project-dialogs";
import { ProjectmemberTable } from "@/components/projectmembers-table";
import { auth } from "@/lib/auth";
import { getLedgers } from "@/lib/db/queries/ledger";
import { getPersons } from "@/lib/db/queries/person";
import { getProjectById } from "@/lib/db/queries/project";
import { getProjectParticipants } from "@/lib/db/queries/projectmember";

export default async function Page({
    params,
}: {
    params: Promise<{ projectid: string }>;
}) {
    const { projectid } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    const project = await getProjectById(projectid);
    const projectParticipants = await getProjectParticipants(projectid);

    if (!project || project.length === 0) {
        return notFound();
    }

    const ledgers = await getLedgers();
    const participants = await getProjectParticipants(projectid);
    const persons = await getPersons();
    const eligible = participants.filter((p) => p.paidAt && !p.refundedAt);
    const personItems = persons.map((p) => ({
        value: p.id,
        label: p.name ?? p.id,
    }));

    return (
        <main className="mx-4">
            <div className="mt-4 mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-semibold">{project[0].name}</h1>
                {session !== null && (
                    <div className="flex items-center gap-2">
                        <EditProjectDialog
                            id={project[0].id}
                            initialName={project[0].name}
                            initialDescription={project[0].description}
                        />
                        <ConfirmCompleteButton projectId={project[0].id} />
                        <CreatePayoutDialog
                            projectId={project[0].id}
                            projectAmount={project[0].amount}
                            ledgers={ledgers}
                            eligible={eligible}
                            personItems={personItems}
                        />
                    </div>
                )}
            </div>
            <div className="mb-4 text-muted-foreground">
                <span className="mr-4">
                    Amount per participant: {project[0].amount}€
                </span>
                <span>
                    Deadline:{" "}
                    {project[0].deadline
                        ? new Date(project[0].deadline).toLocaleString()
                        : "No deadline"}
                </span>
            </div>
            <ProjectmemberTable
                participants={projectParticipants}
                projectAmount={project[0].amount}
                refundable={project[0].refundable}
            />
        </main>
    );
}
