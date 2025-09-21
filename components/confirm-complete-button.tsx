"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { setProjectCompleted } from "@/lib/db/queries/project";

export function ConfirmCompleteButton({ projectId }: { projectId: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    async function action() {
        startTransition(async () => {
            await setProjectCompleted(projectId, true);
            router.refresh();
        });
    }
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Mark Completed</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Mark project as completed?</DialogTitle>
                    <DialogDescription>
                        This will mark the project as completed.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button onClick={action} disabled={isPending}>
                            Confirm
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
