import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  ChevronDown,
  Clock3,
  FileText,
  ListTodo,
  Plus,
  SendHorizontal,
  Upload,
  User,
  X,
  Check,
  ZoomIn,
  ExternalLink,
  Download,
  Loader2,
} from "lucide-react";
import type { HomeworkTask } from "../../types/course";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import noChatIllustration from "../../assets/images/no-chat.svg";
import {
  getTaskSubmission,
  uploadTaskAttachment,
  deleteSubmissionAttachmentApi,
  updateTaskStatusApi,
  sendTaskMessageApi,
} from "../../services/homeworkService";

export type HomeworkDocItem = {
  id?: number | string;
  fileName: string;
  fileUrl?: string;
  fileSize?: number;
};

type HomeworkTaskDialogProps = {
  task?: HomeworkTask | null;
  taskId?: string | number | null;
  instructorName?: string;
  onClose: () => void;
  onStatusChange?: (taskId: string | number, newStatus: string) => void;
};

type TimelineItem =
  | {
      id: string | number;
      type: "message";
      sender: "student" | "instructor";
      senderName: string;
      avatar?: string;
      text: string;
      imageUrl?: string;
      time: string;
      date?: string;
    }
  | {
      id: string | number;
      type: "system";
      user: string;
      actionText: string;
      statusText: string;
      statusColor: "emerald" | "blue" | "slate" | "red" | "amber";
      time: string;
      date?: string;
    };

const KHMER_MONTHS = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
];

export function formatKhmerDate(dateInput: Date | string | number = new Date()): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const day = d.getDate();
  const month = KHMER_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

type KhmerStatus =
  | "កិច្ចការថ្មី"
  | "កំពុងធ្វើ"
  | "ស្នើពិនិត្យ"
  | "បញ្ចប់"
  | "យឺតយ៉ាវ"
  | "មិនទាន់បញ្ជូន";

export function mapToKhmerStatus(status?: string): KhmerStatus {
  if (!status) return "កិច្ចការថ្មី";
  switch (status) {
    case "DOING":
    case "កំពុងធ្វើ":
    case "IN_PROGRESS":
      return "កំពុងធ្វើ";
    case "SUBMITTED":
    case "ស្នើពិនិត្យ":
      return "ស្នើពិនិត្យ";
    case "GRADED":
    case "បញ្ចប់":
    case "DONE":
    case "COMPLETED":
      return "បញ្ចប់";
    case "LATE":
    case "យឺតយ៉ាវ":
      return "យឺតយ៉ាវ";
    case "NOT_SUBMITTED":
    case "កិច្ចការថ្មី":
    case "មិនទាន់បញ្ជូន":
    default:
      return "កិច្ចការថ្មី";
  }
}

const statusColors: Record<KhmerStatus, { text: string; bg: string; border: string }> = {
  កិច្ចការថ្មី: { text: "text-slate-800", bg: "bg-slate-100", border: "border-slate-200" },
  កំពុងធ្វើ: { text: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
  ស្នើពិនិត្យ: { text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  បញ្ចប់: { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  យឺតយ៉ាវ: { text: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  មិនទាន់បញ្ជូន: { text: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
};

function getInitialTimelineForTask(): TimelineItem[] {
  return [];
}

export function HomeworkTaskDialog({ task, taskId, instructorName: _instructorName, onClose, onStatusChange }: HomeworkTaskDialogProps) {
  const role = useAuthStore((s) => s.role);
  const statusOptions: KhmerStatus[] =
    role === "admin"
      ? ["កិច្ចការថ្មី", "កំពុងធ្វើ", "ស្នើពិនិត្យ", "បញ្ចប់", "យឺតយ៉ាវ"]
      : ["កិច្ចការថ្មី", "កំពុងធ្វើ", "ស្នើពិនិត្យ"];

  const adminName = "ខូច គឿន";
  const studentName = "Sophath";
  const verifierName = adminName;

  const currentSender: "student" | "instructor" = role === "admin" ? "instructor" : "student";
  const currentSenderName = role === "admin" ? adminName : studentName;

  const effectiveTaskId = task?.id ?? taskId ?? 1;

  const [isOpen, setIsOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState(task?.title || "កិច្ចការ");
  const [taskDescription, setTaskDescription] = useState(task?.description || "");
  const [status, setStatus] = useState<KhmerStatus>(() =>
    task?.status ? mapToKhmerStatus(task.status) : "កិច្ចការថ្មី"
  );
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [timeline, setTimeline] = useState<TimelineItem[]>(() =>
    getInitialTimelineForTask()
  );
  const [input, setInput] = useState("");
  const [documents, setDocuments] = useState<HomeworkDocItem[]>(() =>
    (task?.attachments || []).map((att) =>
      typeof att === "string" ? { fileName: att } : att
    )
  );
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const hasChatMessages = timeline.length > 0;

  const closeTimeout = useRef<number | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const statusDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingMessages(true);

    if (task) {
      if (task.title) setTaskTitle(task.title);
      if (task.description) setTaskDescription(task.description);
      setStatus(mapToKhmerStatus(task.status));
      setDocuments(
        (task.attachments || []).map((att) =>
          typeof att === "string" ? { fileName: att } : att
        )
      );
    }
    setTimeline(getInitialTimelineForTask());

    getTaskSubmission(effectiveTaskId)
      .then((sub) => {
        if (!isMounted) return;
        if (sub.taskTitle) setTaskTitle(sub.taskTitle);
        if (sub.taskDescription) setTaskDescription(sub.taskDescription);
        if (sub.status) {
          setStatus(mapToKhmerStatus(sub.status));
        }
        if (sub.attachments && sub.attachments.length > 0) {
          setDocuments(
            sub.attachments.map((a) => ({
              id: a.id,
              fileName: a.fileName,
              fileUrl: a.fileUrl,
              fileSize: a.fileSize,
            }))
          );
        }
        if (sub.messages && sub.messages.length > 0) {
          setTimeline(
            sub.messages.map((m) => {
              if (m.text && m.text.startsWith("[SYSTEM_STATUS]:")) {
                const parts = m.text.replace("[SYSTEM_STATUS]:", "").split(":");
                const statusCode = parts[0] || "";
                const statusLabel = parts[1] || mapToKhmerStatus(statusCode);
                const sColor: "emerald" | "blue" | "slate" | "red" | "amber" =
                  statusCode === "GRADED"
                    ? "emerald"
                    : statusCode === "SUBMITTED"
                    ? "blue"
                    : statusCode === "LATE"
                    ? "red"
                    : statusCode === "DOING" || statusCode === "NOT_SUBMITTED"
                    ? "amber"
                    : "slate";

                return {
                  id: m.id,
                  type: "system",
                  user: m.senderName || (m.sender === "instructor" ? adminName : studentName),
                  actionText: "បានផ្លាស់ប្តូរស្ថានភាពកិច្ចការទៅ",
                  statusText: statusLabel,
                  statusColor: sColor,
                  time: new Date(m.sentAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  }),
                  date: formatKhmerDate(m.sentAt),
                };
              }

              const isInst = m.sender === "instructor";
              const sName = isInst ? (m.senderName || adminName) : (m.senderName || studentName);
              return {
                id: m.id,
                type: "message",
                sender: m.sender,
                senderName: sName,
                avatar: isInst ? undefined : "/e20220628.jpg",
                text: m.text,
                time: new Date(m.sentAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }),
                date: formatKhmerDate(m.sentAt),
              };
            })
          );
        } else {
          setTimeline([]);
        }
      })
      .catch((err) => {
        console.warn("[HomeworkTaskDialog] getTaskSubmission error:", err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingMessages(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [effectiveTaskId, task, studentName, verifierName, adminName]);

  const handleClose = useCallback(() => {
    if (closeTimeout.current !== null) return;
    setIsOpen(false);
    closeTimeout.current = window.setTimeout(onClose, 500);
  }, [onClose]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (selectedPreviewImage) {
          setSelectedPreviewImage(null);
        } else {
          handleClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (closeTimeout.current !== null) window.clearTimeout(closeTimeout.current);
    };
  }, [handleClose, selectedPreviewImage]);

  // Click outside to close status dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto scroll chat to bottom when timeline updates
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [timeline]);

  const getCurrentFormattedTime = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");

    try {
      const savedMsg = await sendTaskMessageApi(effectiveTaskId, {
        text,
        senderName: currentSenderName,
        sender: currentSender,
      });

      const newMessage: TimelineItem = {
        id: savedMsg.id,
        type: "message",
        sender: currentSender,
        senderName: savedMsg.senderName || currentSenderName,
        avatar: currentSender === "instructor" ? undefined : "/e20220628.jpg",
        text: savedMsg.text,
        time: getCurrentFormattedTime(),
        date: formatKhmerDate(new Date()),
      };
      setTimeline((prev) => [...prev, newMessage]);
      useNotificationStore.getState().fetchNotifications(role);
    } catch (err) {
      console.warn("sendTaskMessageApi failed, adding locally:", err);
      const newMessage: TimelineItem = {
        id: Date.now(),
        type: "message",
        sender: currentSender,
        senderName: currentSenderName,
        avatar: currentSender === "instructor" ? undefined : "/e20220628.jpg",
        text,
        time: getCurrentFormattedTime(),
        date: formatKhmerDate(new Date()),
      };
      setTimeline((prev) => [...prev, newMessage]);
    }
  };

  const handleStatusChange = async (newStatus: KhmerStatus) => {
    if (newStatus === status) {
      setIsStatusMenuOpen(false);
      return;
    }

    setStatus(newStatus);
    setIsStatusMenuOpen(false);

    const statusColor =
      newStatus === "បញ្ចប់"
        ? "emerald"
        : newStatus === "ស្នើពិនិត្យ"
        ? "blue"
        : newStatus === "យឺតយ៉ាវ"
        ? "red"
        : newStatus === "កំពុងធ្វើ" || newStatus === "មិនទាន់បញ្ជូន"
        ? "amber"
        : "slate";

    const systemLog: TimelineItem = {
      id: Date.now(),
      type: "system",
      user: currentSenderName,
      actionText: "បានផ្លាស់ប្តូរស្ថានភាពកិច្ចការទៅ",
      statusText: newStatus,
      statusColor,
      time: getCurrentFormattedTime(),
      date: formatKhmerDate(new Date()),
    };

    const mappedStatus =
      newStatus === "បញ្ចប់"
        ? "GRADED"
        : newStatus === "ស្នើពិនិត្យ"
        ? "SUBMITTED"
        : newStatus === "យឺតយ៉ាវ"
        ? "LATE"
        : newStatus === "កំពុងធ្វើ"
        ? "DOING"
        : "NOT_SUBMITTED";

    if (task) task.status = mappedStatus as any;
    onStatusChange?.(effectiveTaskId, mappedStatus);
    setTimeline((prev) => [...prev, systemLog]);

    try {
      await updateTaskStatusApi(effectiveTaskId, mappedStatus, {
        senderName: currentSenderName,
        sender: currentSender,
      });
      useNotificationStore.getState().fetchNotifications(role);
    } catch (err) {
      console.warn("updateTaskStatusApi error:", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadTaskAttachment(effectiveTaskId, file);

        setDocuments((prev) => [
          ...prev,
          {
            id: res.attachment.id,
            fileName: res.attachment.fileName,
            fileUrl: res.attachment.fileUrl,
            fileSize: res.attachment.fileSize,
          },
        ]);

        if (res.message) {
          const newDocMessage: TimelineItem = {
            id: res.message.id,
            type: "message",
            sender: "student",
            senderName: res.message.senderName || studentName,
            text: res.message.text,
            time: getCurrentFormattedTime(),
            date: formatKhmerDate(new Date()),
          };
          setTimeline((prev) => [...prev, newDocMessage]);
        }
      }
      useNotificationStore.getState().fetchNotifications(role);
    } catch (error) {
      console.error("Upload error:", error);
      alert("បរាជ័យក្នុងការបញ្ចូលឯកសារ (Failed to upload file)");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const removeDocument = async (index: number) => {
    const doc = documents[index];
    if (doc?.id) {
      try {
        await deleteSubmissionAttachmentApi(doc.id);
      } catch (err) {
        console.error("deleteSubmissionAttachmentApi error:", err);
      }
    }
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrawerBackdropClick = (e: React.MouseEvent) => {
    if (selectedPreviewImage) {
      e.stopPropagation();
      return;
    }
    handleClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={handleDrawerBackdropClick}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="homework-task-title"
        className={`absolute inset-y-0 right-0 flex w-full max-w-[840px] flex-col overflow-visible bg-white shadow-2xl transition-transform duration-300 ease-out font-kantumruy ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Protruding circular Back Arrow Button */}
        {isOpen && (
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close drawer"
            className="absolute -left-4 top-3.5 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-white text-[#60738d] shadow-md hover:text-slate-900 border border-slate-200/90 z-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
        )}

        {/* Top Header Bar split into two sections */}
        <div className="flex h-14 w-full shrink-0 border-b border-slate-200/90 bg-white">
          <div className="flex w-full md:w-[53%] lg:w-[53%] items-center justify-center border-r border-slate-200/80 px-6">
            <h2 id="homework-task-title" className="text-base font-normal text-slate-800 font-kantumruy">
              កិច្ចការ
            </h2>
          </div>
          <div className="hidden md:flex w-full md:w-[47%] lg:w-[47%] items-center justify-center px-6">
            <h3 className="text-base font-normal text-slate-800 font-kantumruy">
              ជជែក
            </h3>
          </div>
        </div>

        {/* Main Body: Two Columns */}
        <div className="flex flex-1 min-h-0 flex-col md:flex-row overflow-hidden">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: Task Details & Attachments */}
          {/* ========================================================================= */}
          <div className="flex w-full md:w-[53%] lg:w-[53%] flex-col border-r border-slate-200/80 bg-white overflow-y-auto p-6 space-y-6">
            <div className="space-y-5">
              {/* Item 1: Title (ចំណងជើង) */}
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200/90 bg-slate-50/70 text-slate-600">
                  <ListTodo className="w-5 h-5 text-slate-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400 font-normal">ចំណងជើង</p>
                  <p className="text-sm font-normal text-slate-800 truncate mt-0.5">
                    {taskTitle || task?.title || "កិច្ចការ"}
                  </p>
                </div>
              </div>

              {/* Item 2: Status (ស្ថានភាព) */}
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200/90 bg-slate-50/70 text-slate-600">
                  <Clock3 className="w-5 h-5 text-slate-500" />
                </div>
                <div className="min-w-0 flex-1 relative" ref={statusDropdownRef}>
                  <p className="text-xs text-slate-400 font-normal">ស្ថានភាព</p>
                  <button
                    type="button"
                    onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                    className="flex items-center gap-1.5 mt-0.5 text-sm font-normal transition-colors hover:opacity-80 cursor-pointer"
                  >
                    <span className={statusColors[status].text}>{status}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Status Dropdown Menu */}
                  {isStatusMenuOpen && (
                    <div className="absolute left-0 top-full mt-1.5 z-20 w-44 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg">
                      {statusOptions.map(
                        (opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleStatusChange(opt)}
                            className="flex w-full items-center justify-between px-3.5 py-2 text-xs font-normal hover:bg-slate-50 text-left cursor-pointer"
                          >
                            <span className={statusColors[opt].text}>{opt}</span>
                            {status === opt && (
                              <Check className="w-4 h-4 text-emerald-600" />
                            )}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Item 3: Verifier (អ្នកផ្ទៀងផ្ទាត់) */}
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#0088A8] to-[#0ab3dc] text-white shadow-2xs ring-1 ring-slate-200">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400 font-normal">អ្នកផ្ទៀងផ្ទាត់</p>
                  <p className="text-sm font-normal text-slate-800 truncate mt-0.5">
                    {verifierName}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 my-4" />

            {/* Section: Documents / Attachments (ឯកសារ) */}
            <div>
              <h4 className="text-sm font-normal text-slate-800 mb-3 font-kantumruy">
                ឯកសារ
              </h4>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="flex flex-wrap gap-3">
                {/* Dashed Add Document Box */}
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex h-24 w-24 flex-col items-center justify-center rounded-xl border-2 border-dashed border-sky-200/90 bg-sky-50/20 hover:bg-sky-50/50 hover:border-sky-300 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="w-5 h-5 text-sky-600 animate-spin mb-1" />
                      <span className="text-[10px] text-sky-600 font-medium font-kantumruy">
                        បញ្ចូល...
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-center text-slate-400 group-hover:text-sky-600 transition-colors">
                        <Upload className="w-5 h-5 mb-1 stroke-[1.8]" />
                      </div>
                      <span className="text-xs font-normal text-slate-600 group-hover:text-sky-600 transition-colors font-kantumruy">
                        បន្ថែម
                      </span>
                    </>
                  )}
                </button>

                {/* Uploaded or Existing Documents */}
                {documents.map((doc, idx) => {
                  const isImage =
                    doc.fileUrl &&
                    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(doc.fileUrl || doc.fileName);

                  return (
                    <div
                      key={`${doc.fileName}-${doc.id || idx}`}
                      className="relative flex h-24 w-24 flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/70 p-2 text-center shadow-2xs group hover:bg-slate-100/80 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDocument(idx);
                        }}
                        className="absolute -top-1.5 -right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-slate-600 text-white shadow-xs hover:bg-red-500 transition-colors cursor-pointer"
                        title="លុបឯកសារ"
                      >
                        <X className="w-3 h-3" />
                      </button>

                      {doc.fileUrl ? (
                        isImage ? (
                          <div
                            onClick={() => setSelectedPreviewImage(doc.fileUrl!)}
                            className="flex flex-col items-center justify-center w-full h-full cursor-zoom-in"
                            title={`ចុចដើម្បីពង្រីក៖ ${doc.fileName}`}
                          >
                            <img
                              src={doc.fileUrl}
                              alt={doc.fileName}
                              className="h-10 w-10 object-cover rounded-md mb-1 border border-slate-200"
                            />
                            <span className="text-[10px] font-normal text-slate-800 truncate w-full px-1">
                              {doc.fileName}
                            </span>
                          </div>
                        ) : (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center justify-center w-full h-full text-center"
                            title={`បើកមើល ឬទាញយក៖ ${doc.fileName}`}
                          >
                            <FileText className="w-6 h-6 text-indigo-500 mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-[11px] font-normal text-slate-800 truncate w-full px-1 hover:underline">
                              {doc.fileName}
                            </span>
                          </a>
                        )
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full text-center">
                          <FileText className="w-6 h-6 text-indigo-500 mb-1" />
                          <span className="text-[11px] font-normal text-slate-800 truncate w-full px-1">
                            {doc.fileName}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Optional Task Instructions if present */}
            {(taskDescription || task?.description) && (
              <div className="pt-2">
                <p className="text-xs font-normal text-slate-500 uppercase tracking-wider mb-1">
                  សេចក្តីណែនាំ
                </p>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-100 font-normal">
                  {taskDescription || task?.description}
                </p>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: Chat & Activity Feed */}
          {/* ========================================================================= */}
          <div className="flex w-full md:w-[47%] lg:w-[47%] flex-col bg-[#f8fafc]/80 min-h-0">
            {/* Scrollable messages area aligned bottom-up */}
            <div className="flex-1 overflow-y-auto p-4 font-kantumruy flex flex-col">
              {isLoadingMessages ? (
                <div className="flex-1 p-4 flex flex-col justify-end space-y-4">
                  {/* Date Pill Skeleton */}
                  <div className="flex justify-center mb-1">
                    <div className="h-5 w-24 bg-slate-200/80 rounded-full animate-pulse" />
                  </div>

                  {/* Instructor message skeleton (left side with avatar) */}
                  <div className="flex items-start gap-2.5 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="w-16 h-3 bg-slate-200/90 rounded animate-pulse" />
                      <div className="w-56 sm:w-64 h-12 bg-white rounded-2xl rounded-tl-xs border border-slate-200/70 shadow-2xs animate-pulse p-3 space-y-1.5">
                        <div className="w-full h-2.5 bg-slate-200/80 rounded" />
                        <div className="w-3/5 h-2.5 bg-slate-200/80 rounded" />
                      </div>
                      <div className="w-12 h-2.5 bg-slate-200/60 rounded ml-1" />
                    </div>
                  </div>

                  {/* System status update skeleton (center) */}
                  <div className="flex items-center justify-between gap-3 py-1.5 px-3 bg-slate-100/80 rounded-lg border border-slate-200/50 animate-pulse my-1">
                    <div className="h-3 w-48 bg-slate-200/80 rounded" />
                    <div className="h-2.5 w-12 bg-slate-200/60 rounded shrink-0" />
                  </div>

                  {/* Student message skeleton (right side) */}
                  <div className="flex flex-col items-end max-w-[80%] ml-auto space-y-1.5">
                    <div className="w-48 sm:w-60 h-11 bg-blue-100/70 rounded-2xl rounded-br-xs animate-pulse p-3 space-y-1.5">
                      <div className="w-full h-2.5 bg-blue-200/80 rounded" />
                      <div className="w-1/2 h-2.5 bg-blue-200/80 rounded" />
                    </div>
                    <div className="w-12 h-2.5 bg-slate-200/60 rounded mr-1" />
                  </div>

                  {/* Another student message skeleton */}
                  <div className="flex flex-col items-end max-w-[80%] ml-auto space-y-1.5">
                    <div className="w-36 h-9 bg-blue-100/70 rounded-2xl rounded-br-xs animate-pulse p-2.5">
                      <div className="w-3/4 h-2.5 bg-blue-200/80 rounded" />
                    </div>
                    <div className="w-12 h-2.5 bg-slate-200/60 rounded mr-1" />
                  </div>
                </div>
              ) : !hasChatMessages ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center my-auto select-none">
                  <div className="w-52 h-44 sm:w-60 sm:h-48 flex items-center justify-center mb-2">
                    <img
                      src={noChatIllustration}
                      alt="No chat yet"
                      className="w-full h-full object-contain pointer-events-none"
                    />
                  </div>
                  <p className="text-sm font-normal text-slate-600 font-kantumruy">
                    មិនទាន់មានសារនៅឡើយទេ
                  </p>
                  <p className="text-xs text-slate-400 font-normal font-kantumruy mt-1 max-w-xs">
                    ចាប់ផ្តើមការសន្ទនា ឬផ្ញើសំណួរអំពីកិច្ចការនេះនៅទីនេះ
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-auto space-y-4 flex flex-col">
                    {/* Timeline Messages & Events with dynamic date separators */}
                    {timeline.map((item, index) => {
                      const itemDate = item.date || formatKhmerDate(new Date());
                      const prevDate =
                        index > 0 ? timeline[index - 1].date || formatKhmerDate(new Date()) : null;
                      const showDateSeparator = index === 0 || itemDate !== prevDate;

                      let itemNode: React.ReactNode = null;

                      if (item.type === "system") {
                        const colorClass =
                          item.statusColor === "emerald"
                            ? "text-emerald-600"
                            : item.statusColor === "blue"
                            ? "text-blue-600"
                            : item.statusColor === "red"
                            ? "text-red-600"
                            : item.statusColor === "amber"
                            ? "text-amber-500"
                            : "text-slate-600";

                        itemNode = (
                          <div
                            key={item.id}
                            className="flex items-start justify-between gap-2 text-xs py-1 px-1 text-slate-600 font-kantumruy"
                          >
                            <span className="leading-snug">
                              <span className="font-normal text-slate-800">{item.user}</span>{" "}
                              {item.actionText}{" "}
                              <span className={`font-normal ${colorClass}`}>
                                {item.statusText}
                              </span>
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 shrink-0 mt-0.5">
                              {item.time}
                            </span>
                          </div>
                        );
                      } else {
                        // Check if the message was sent by ME (the current logged-in user)
                        const isMe =
                          role === "admin"
                            ? item.sender === "instructor" || item.senderName === adminName
                            : item.sender === "student" || item.senderName === studentName;

                        if (isMe) {
                          // Messages sent by ME -> Positioned on the RIGHT side
                          itemNode = (
                            <div key={item.id} className="flex flex-col items-end max-w-[85%] ml-auto">
                              {item.imageUrl ? (
                                <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 bg-white">
                                  <div
                                    onClick={() => setSelectedPreviewImage(item.imageUrl!)}
                                    className="relative group cursor-zoom-in overflow-hidden"
                                    title="ចុចដើម្បីពង្រីករូបភាព (Click to zoom)"
                                  >
                                    <img
                                      src={item.imageUrl}
                                      alt="Homework Submission Preview"
                                      className="w-full max-h-52 object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-kantumruy backdrop-blur-xs">
                                        <ZoomIn className="w-3.5 h-3.5" />
                                        ពង្រីក
                                      </span>
                                    </div>
                                  </div>
                                  <div className="bg-[#2563eb] text-white p-3.5 text-xs sm:text-sm leading-relaxed font-normal">
                                    {item.text}
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-[#2563eb] text-white px-4 py-2.5 rounded-2xl rounded-br-xs text-xs sm:text-sm leading-relaxed shadow-xs font-normal">
                                  {item.text}
                                </div>
                              )}
                              <span className="text-xs font-mono text-slate-400 mt-1 mr-1">
                                {item.time}
                              </span>
                            </div>
                          );
                        } else {
                          // Messages sent by OTHER person -> Positioned on the LEFT side
                          const isInst =
                            item.sender === "instructor" || item.senderName === adminName;
                          const otherAvatar =
                            item.avatar ||
                            (isInst ? undefined : "/e20220628.jpg");
                          const otherName =
                            item.senderName ||
                            (item.sender === "instructor" ? adminName : studentName);

                          itemNode = (
                            <div key={item.id} className="flex flex-col items-start max-w-[85%] mr-auto">
                              <div className="flex items-start gap-2.5">
                                {isInst ? (
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#0088A8] to-[#0ab3dc] text-white shadow-2xs mt-0.5 ring-1 ring-slate-200">
                                    <User className="h-4 w-4" />
                                  </div>
                                ) : (
                                  <img
                                    src={otherAvatar || "/e20220628.jpg"}
                                    alt={otherName}
                                    className="h-9 w-9 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5 shadow-2xs"
                                  />
                                )}
                                <div className="flex flex-col items-start">
                                  <p className="text-xs text-slate-500 font-semibold mb-1 ml-1 font-kantumruy">
                                    {otherName}
                                  </p>
                                  {item.imageUrl ? (
                                    <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 bg-white">
                                      <div
                                        onClick={() => setSelectedPreviewImage(item.imageUrl!)}
                                        className="relative group cursor-zoom-in overflow-hidden"
                                        title="ចុចដើម្បីពង្រីករូបភាព (Click to zoom)"
                                      >
                                        <img
                                          src={item.imageUrl}
                                          alt="Homework Submission Preview"
                                          className="w-full max-h-52 object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-kantumruy backdrop-blur-xs">
                                            <ZoomIn className="w-3.5 h-3.5" />
                                            ពង្រីក
                                          </span>
                                        </div>
                                      </div>
                                      <div className="bg-white text-slate-800 p-3.5 text-xs sm:text-sm leading-relaxed font-normal border-t border-slate-100">
                                        {item.text}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="bg-white border border-slate-200/90 shadow-2xs px-4 py-2.5 rounded-2xl rounded-tl-xs">
                                      <p className="text-xs sm:text-sm font-normal text-slate-800 leading-relaxed font-kantumruy">
                                        {item.text}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <span className="text-xs font-mono text-slate-400 mt-1 ml-11">
                                {item.time}
                              </span>
                            </div>
                          );
                        }
                      }

                      return (
                        <Fragment key={item.id}>
                          {showDateSeparator && (
                            <div className="flex justify-center my-2">
                              <span className="rounded-full bg-slate-200/80 px-3 py-0.5 text-xs font-normal text-slate-600">
                                {itemDate}
                              </span>
                            </div>
                          )}
                          {itemNode}
                        </Fragment>
                      );
                    })}
                  </div>

                  <div ref={chatBottomRef} />
                </>
              )}
            </div>

            {/* Chat Input Bar */}
            <div className="p-3.5 bg-white border-t border-slate-200/80 flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="ភ្ជាប់ឯកសារ"
              >
                <Plus className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="មតិយោបល់..."
                className="flex-1 rounded-full border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none font-kantumruy"
              />

              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="ផ្ញើ"
              >
                <SendHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* IMAGE LIGHTBOX PREVIEW MODAL (Portaled to document.body) */}
      {/* ========================================================================= */}
      {selectedPreviewImage &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-4 transition-opacity font-kantumruy"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPreviewImage(null);
            }}
          >
            {/* Top Bar with actions */}
            <div
              className="flex w-full max-w-5xl items-center justify-between pb-3 text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-200">
                  មើលរូបភាពកិច្ចការ (Coursework Preview)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedPreviewImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="បើកក្នុងផ្ទាំងថ្មី (Open in new tab)"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <a
                  href={selectedPreviewImage}
                  download="homework-submission.jpg"
                  title="ទាញយក (Download)"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPreviewImage(null);
                  }}
                  title="បិទ (Close - Esc)"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Centered Image Container */}
            <div
              className="relative flex max-w-5xl max-h-[85vh] items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPreviewImage}
                alt="Expanded Preview"
                className="max-h-[82vh] max-w-full object-contain rounded-lg"
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
