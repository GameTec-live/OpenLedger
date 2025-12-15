"use client";
import { Camera, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { ComboBox } from "@/components/combobox";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Ledger } from "@/lib/db/queries/ledger";
import type { ProjectParticipant } from "@/lib/db/queries/projectmember";
import { payoutProject } from "@/lib/server/transactions";

export function CreatePayoutDialog({
    projectId,
    projectAmount,
    ledgers,
    eligible,
    personItems,
}: {
    projectId: string;
    projectAmount: number;
    ledgers: Ledger[];
    eligible: ProjectParticipant[];
    personItems: { value: string; label: string; original: string }[];
}) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [ledgerId, setLedgerId] = useState("");
    const [personId, setPersonId] = useState(""); // pure ID for backend
    const [selectedPersonValue, setSelectedPersonValue] = useState(""); // combined value for ComboBox
    const [description, setDescription] = useState("");
    const [invoiceUrl, setInvoiceUrl] = useState("");
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [streamReady, setStreamReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const ledgerItems = ledgers.map((l) => ({ value: l.id, label: l.name }));

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const count = eligible.length;
    const total = projectAmount * count;
    const [amount, setAmount] = useState(String(-Math.abs(total)));

    const startCamera = async () => {
        try {
            setCameraOpen(true);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
            });
            streamRef.current = stream;
            setStreamReady(true);
        } catch (err) {
            setError("Could not access camera");
            setCameraOpen(false);
        }
    };

    // Attach stream to video element once both are available
    useEffect(() => {
        if (
            cameraOpen &&
            streamReady &&
            streamRef.current &&
            videoRef.current
        ) {
            const video = videoRef.current;
            video.srcObject = streamRef.current;
            video.onloadedmetadata = () => {
                video.play();
                setCameraReady(true);
            };
        }
    }, [cameraOpen, streamReady]);

    const stopCamera = () => {
        if (streamRef.current) {
            for (const track of streamRef.current.getTracks()) {
                track.stop();
            }
            streamRef.current = null;
        }
        setCameraOpen(false);
        setCameraReady(false);
        setStreamReady(false);
    };

    useEffect(() => {
        if (open) {
            setDescription("");
            setInvoiceUrl("");
            setCameraOpen(false);
            setError(null);
            setLedgerId("");
            setPersonId("");
            setSelectedPersonValue("");
        } else {
            // Clean up camera stream when dialog closes
            stopCamera();
        }
    }, [open]);

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Ensure video has valid dimensions
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            setError("Camera not ready yet, please wait");
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
            setInvoiceUrl(dataUrl);
            stopCamera();
        }
    };

    const onPersonChange = (v: string | string[]) => {
        const val = Array.isArray(v) ? v[0] : v;
        setSelectedPersonValue(val ?? "");
        const match = personItems.find((i) => i.value === val);
        setPersonId(match?.original ?? "");
    };

    const onSubmit = async () => {
        setError(null);
        startTransition(async () => {
            try {
                if (!ledgerId) throw new Error("Select a ledger");
                if (!personId) throw new Error("Select a person");
                const amt = Number(amount);
                if (!Number.isFinite(amt)) throw new Error("Invalid amount");
                await payoutProject(
                    projectId,
                    personId, // resolved pure ID
                    ledgerId,
                    amt,
                    description,
                    invoiceUrl,
                );
                setOpen(false);
            } catch (e: unknown) {
                const msg =
                    e instanceof Error ? e.message : "Failed to create payout";
                setError(msg);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary">Mark Paid Out</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create payout transaction</DialogTitle>
                    <DialogDescription>
                        Negative amount preset: project amount times all paid
                        (non-refunded) participants.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                        <Label>Ledger</Label>
                        <ComboBox
                            items={ledgerItems}
                            value={ledgerId}
                            onChange={(v) => setLedgerId(String(v))}
                            placeholder="Select a ledger"
                            buttonClassName="w-full justify-between"
                            contentClassName="w-[360px] p-0"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Recipient (person)</Label>
                        <ComboBox
                            items={personItems}
                            value={selectedPersonValue} // combined value for UI
                            onChange={onPersonChange} // resolve to original ID
                            placeholder="Select recipient"
                            buttonClassName="w-full justify-between"
                            contentClassName="w-[360px] p-0"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Amount</Label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Description</Label>
                        <Input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Invoice URL</Label>
                        <div className="flex gap-2">
                            <Input
                                value={invoiceUrl}
                                onChange={(e) => setInvoiceUrl(e.target.value)}
                                placeholder="Enter URL or take a photo"
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={cameraOpen ? stopCamera : startCamera}
                                title={
                                    cameraOpen ? "Close camera" : "Take photo"
                                }
                            >
                                {cameraOpen ? (
                                    <X className="h-4 w-4" />
                                ) : (
                                    <Camera className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        {cameraOpen && (
                            <div className="relative mt-2">
                                <video
                                    ref={videoRef}
                                    className="w-full rounded-md border"
                                    autoPlay
                                    playsInline
                                    muted
                                />
                                <Button
                                    type="button"
                                    onClick={capturePhoto}
                                    className="mt-2 w-full"
                                    disabled={!cameraReady}
                                >
                                    {cameraReady
                                        ? "Capture Photo"
                                        : "Loading camera..."}
                                </Button>
                            </div>
                        )}
                        <canvas ref={canvasRef} className="hidden" />
                        {invoiceUrl && invoiceUrl.startsWith("data:image") && (
                            <div className="mt-2">
                                <img
                                    src={invoiceUrl}
                                    alt="Captured invoice"
                                    className="max-h-32 rounded-md border"
                                />
                            </div>
                        )}
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={onSubmit} disabled={isPending}>
                        {isPending ? "Saving..." : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
