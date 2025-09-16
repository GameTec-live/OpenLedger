import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { getProjects } from "@/lib/db/queries/project";

export default async function Page() {
    const projects = await getProjects();

    return (
        <main className="mx-4">
            <h1 className="text-4xl font-semibold mb-6 mt-4 text-center">
                Projects
            </h1>
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
