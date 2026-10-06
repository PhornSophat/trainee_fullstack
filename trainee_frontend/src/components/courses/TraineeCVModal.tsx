import { useEffect } from "react";

interface TraineeCVModalProps {
  isOpen: boolean;
  onClose: () => void;
  traineeName?: string;
  department?: string;
  year?: string;
  avatarUrl?: string;
}

export function TraineeCVModal({ isOpen, onClose }: TraineeCVModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const pdfUrl = "/sophat-phorn-cv.pdf";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200/90 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Full PDF View Container */}
        <div className="w-full h-full rounded-2xl overflow-hidden">
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0`}
            title="Trainee CV PDF"
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
