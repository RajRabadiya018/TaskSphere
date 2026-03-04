"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";


interface ConfirmDialogProps {
    open: boolean;                        
    title: string;                         
    description: string;                  
    onConfirm: () => void;                 
    onCancel: () => void;                  
    confirmLabel?: string;                
    cancelLabel?: string;                 
    destructive?: boolean;                 
}

export default function ConfirmDialog({
    open,
    title,
    description,
    onConfirm,
    onCancel,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    destructive = false,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2 sm:justify-end">
                    {}
                    <Button variant="ghost" onClick={onCancel}>
                        {cancelLabel}
                    </Button>
                    {}
                    <Button
                        variant={destructive ? "destructive" : "default"}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
