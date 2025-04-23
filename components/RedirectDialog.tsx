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
import { Progress } from "@/components/ui/progress";
import React, { useEffect, useState } from "react";

interface RedirectDialogProps {
  redirectUrl?: string;
  timeoutDuration?: number;
}

const RedirectDialog: React.FC<RedirectDialogProps> = ({
  redirectUrl = "https://mrdavepizza.com/",
  timeoutDuration = 4000,
}) => {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [redirectTimeout, setRedirectTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [progressInterval, setProgressInterval] =
    useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Show dialog after component mounts
    const timer = setTimeout(() => {
      setOpen(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (open) {
      // Set up the redirect timeout
      const timeout = setTimeout(() => {
        window.location.href = redirectUrl;
      }, timeoutDuration);
      setRedirectTimeout(timeout);

      // Set up progress bar update
      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          const newProgress = prevProgress + 100 / (timeoutDuration / 100);
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 100);
      setProgressInterval(interval);

      return () => {
        clearTimeout(timeout);
        clearInterval(interval);
      };
    }
  }, [open, redirectUrl, timeoutDuration]);

  const handleCancel = () => {
    if (redirectTimeout) clearTimeout(redirectTimeout);
    if (progressInterval) clearInterval(progressInterval);
    setOpen(false);
  };

  // This function handles both the Cancel button click and outside clicks
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // This is triggered when dialog is being closed (including outside clicks)
      handleCancel();
    }
    setOpen(newOpen);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Redirecting</DialogTitle>
          <DialogDescription className="text-lg font-medium mt-2">
            Redirecting to mrdavepizza.com/
          </DialogDescription>
        </DialogHeader>
        <div className="my-4">
          <Progress
            value={progress}
            className="h-2"
          />
        </div>
        <DialogFooter className="flex justify-between">
          <Button onClick={handleCancel}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RedirectDialog;
