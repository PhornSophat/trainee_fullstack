import { useState, useEffect } from "react";
import {
  FileText,
  Trash2,
  Download,
  Eye,
  Loader2,
  FileSpreadsheet,
  Presentation,
  Archive,
  FileCode,
} from "lucide-react";
import type { LessonDocument } from "@/types/course";
import { generatePdfThumbnail } from "@/lib/pdfThumbnail";

interface DocumentCardProps {
  doc: LessonDocument;
  onDelete: (doc: LessonDocument) => void;
  onPreview?: (doc: LessonDocument) => void;
}

export function DocumentCard({ doc, onDelete, onPreview }: DocumentCardProps) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [isLoadingThumb, setIsLoadingThumb] = useState(false);
  const [thumbError, setThumbError] = useState(false);

  const fileExt = (doc.title.split(".").pop() || doc.fileType || "").toLowerCase();
  const isPdf = fileExt === "pdf" || doc.fileType?.toLowerCase() === "pdf";
  const isImage = ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(fileExt);
  const isWord = ["doc", "docx"].includes(fileExt);
  const isExcel = ["xls", "xlsx", "csv"].includes(fileExt);
  const isPpt = ["ppt", "pptx"].includes(fileExt);
  const isZip = ["zip", "rar", "7z", "tar", "gz"].includes(fileExt);

  // Generate thumbnail for PDF
  useEffect(() => {
    let isMounted = true;
    if (isPdf && doc.fileUrl) {
      setIsLoadingThumb(true);
      setThumbError(false);
      generatePdfThumbnail(doc.fileUrl)
        .then((url) => {
          if (isMounted) {
            setThumbUrl(url);
            setIsLoadingThumb(false);
          }
        })
        .catch((err) => {
          console.warn("[DocumentCard] Failed to generate PDF first page thumbnail:", err);
          if (isMounted) {
            setThumbError(true);
            setIsLoadingThumb(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [doc.fileUrl, isPdf]);

  const handleOpenPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPreview) {
      onPreview(doc);
    } else {
      window.open(doc.fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = doc.fileUrl;
    link.download = doc.title;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      onClick={handleOpenPreview}
      className="group relative flex flex-col justify-between w-28 h-36 border border-slate-200 hover:border-cyan-500 rounded-xl overflow-hidden bg-white shadow-2xs hover:shadow-md transition-all cursor-pointer select-none shrink-0"
      title={`${doc.title} (ចុចដើម្បីមើលឯកសារ)`}
    >
      {/* ── TOP PREVIEW AREA (First Page / Thumbnail / Icon) ── */}
      <div className="relative w-full h-[110px] bg-slate-100 overflow-hidden flex items-center justify-center border-b border-slate-100">
        {/* Case 1: PDF First Page Thumbnail */}
        {isPdf && thumbUrl && !thumbError && (
          <img
            src={thumbUrl}
            alt={doc.title}
            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
          />
        )}

        {/* Case 2: PDF Thumbnail Loading Skeleton */}
        {isPdf && isLoadingThumb && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 animate-pulse">
            <Loader2 className="w-4 h-4 text-cyan-600 animate-spin mb-1" />
            <span className="text-[9px] font-medium text-slate-400">ទំព័រទី ១...</span>
          </div>
        )}

        {/* Case 3: Direct Image Preview */}
        {isImage && (
          <img
            src={doc.fileUrl}
            alt={doc.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}

        {/* Case 4: Non-PDF or PDF Render Fallback */}
        {((isPdf && thumbError && !isLoadingThumb) || (!isPdf && !isImage)) && (
          <div className="flex flex-col items-center justify-center p-2 text-center">
            {isPdf && (
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
                <FileText className="w-6 h-6" />
              </div>
            )}
            {isWord && (
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                <FileText className="w-6 h-6" />
              </div>
            )}
            {isExcel && (
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
            )}
            {isPpt && (
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                <Presentation className="w-6 h-6" />
              </div>
            )}
            {isZip && (
              <div className="p-2 rounded-lg bg-violet-50 text-violet-600 border border-violet-100">
                <Archive className="w-6 h-6" />
              </div>
            )}
            {!isPdf && !isWord && !isExcel && !isPpt && !isZip && (
              <div className="p-2 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                <FileCode className="w-6 h-6" />
              </div>
            )}
          </div>
        )}

        {/* Top Type Badge (PDF / DOC / PPT etc.) */}
        <div className="absolute top-1.5 left-1.5 z-10 pointer-events-none">
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shadow-2xs tracking-wider ${
              isPdf
                ? "bg-rose-600 text-white"
                : isWord
                ? "bg-blue-600 text-white"
                : isExcel
                ? "bg-emerald-600 text-white"
                : isPpt
                ? "bg-amber-600 text-white"
                : isZip
                ? "bg-violet-600 text-white"
                : "bg-slate-700 text-white"
            }`}
          >
            {fileExt.slice(0, 4) || "FILE"}
          </span>
        </div>

        {/* Delete (Trash) Button on Top Right */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(doc);
          }}
          className="absolute top-1 right-1 z-20 p-1 rounded-md bg-white/90 hover:bg-rose-50 text-slate-400 hover:text-rose-600 shadow-xs opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
          title="លុបឯកសារ (Delete)"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 backdrop-blur-[1px]">
          <button
            type="button"
            onClick={handleOpenPreview}
            className="p-1.5 rounded-lg bg-white/95 text-slate-700 hover:text-cyan-600 hover:bg-white shadow-xs transition-transform hover:scale-110 cursor-pointer"
            title="មើលឯកសារ (Preview)"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 rounded-lg bg-white/95 text-slate-700 hover:text-cyan-600 hover:bg-white shadow-xs transition-transform hover:scale-110 cursor-pointer"
            title="ទាញយកឯកសារ (Download)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── BOTTOM INFO AREA (Title & File Size) ── */}
      <div className="p-2 flex flex-col justify-center bg-white flex-1 min-h-0">
        <p
          className="text-[11px] font-medium text-slate-800 line-clamp-1 leading-tight break-all"
          title={doc.title}
        >
          {doc.title}
        </p>
      </div>
    </div>
  );
}
