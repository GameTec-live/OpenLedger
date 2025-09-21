import { headers } from "next/headers";
import Link from "next/link";
import { CreateProjectDialog } from "@/components/project-dialogs";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getGroups } from "@/lib/db/queries/group";
import { getPersons } from "@/lib/db/queries/person";
import { getProjects } from "@/lib/db/queries/project";

export default async function Page() {
    const session = await auth.api.getSession({ headers: await headers() });
    const [projects, persons, groups] = await Promise.all([
        getProjects(),
        getPersons(),
        getGroups(),
    ]);

    return (
        <main className="mx-4">
            <div className="mt-4 mb-6 flex items-center justify-between">
                <h1 className="text-4xl font-semibold">Projects</h1>
                {session !== null && (
                    <CreateProjectDialog persons={persons} groups={groups} />
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {projects.map((project) => (
                    <Link key={project.id} href={`/projects/${project.id}`}>
                        <Card className="relative overflow-hidden group">
                            {(project.completedAt || project.paidOutAt) && (
                                <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-background/60 backdrop-blur-sm opacity-100 transition-opacity duration-200 group-hover:opacity-0">
                                    <div className="text-center px-4">
                                        {project.completedAt && (
                                            <p className="font-medium">
                                                Completed on{" "}
                                                {new Date(
                                                    project.completedAt,
                                                ).toLocaleString()}
                                            </p>
                                        )}
                                        {project.paidOutAt && (
                                            <p className="font-medium">
                                                Paid out on{" "}
                                                {new Date(
                                                    project.paidOutAt,
                                                ).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle>{project.name}</CardTitle>
                                <CardDescription>
                                    {project.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl">
                                    {project.amount}€
                                </div>
                                <div>
                                    {project.deadline
                                        ? new Date(
                                              project.deadline,
                                          ).toLocaleString()
                                        : "No deadline"}
                                </div>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground">
                                by {project.ownerName} -{" "}
                                {project.refundable
                                    ? "Refundable"
                                    : "Non-refundable"}{" "}
                                - {project.id}
                            </CardFooter>
                        </Card>
                    </Link>
                ))}
            </div>
        </main>
    );
}
