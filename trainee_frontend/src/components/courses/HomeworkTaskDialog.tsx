import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage, HomeworkStatus, HomeworkTask } from "../../types/course"
import { mockInstructorChat } from "../../data/chat.mock";

type HomeworkTaskDialogProps = {
    task: HomeworkTask;
    instructorName?: string;
    onClose: () => void;
}

const statusStyles: Record<HomeworkStatus, string> = {
    GRADED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    NOT_SUBMITTED: "bg-slate-100 text-slate-500 border-slate-200",
    LATE: "bg-red-50 text-red-700 border-red-200",
    SUBMITTED: "bg-indigo-50 text-emerald-700 border-emberald-200",
};

function formatDate( date?: string, ): string {
    if( !date ) return "--";
    return new Date(date).toLocaleString("en-GB");
}

export function HomeworkTaskDialog({ task, instructorName, onClose }: HomeworkTaskDialogProps) {

    const [messages, setMessages] = useState<ChatMessage[]>(mockInstructorChat);
    const [input, setInput] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const closeTimeout = useRef<number | null>(null);

    const handleSend = () => {
        const text = input.trim();
        if( !text ) return;

        setMessages((prev) => [ ...prev, 
            { id: Date.now(), sender: "student", text, sentAt: new Date().toISOString() }, 
        ]);

        setInput("");
    }

    const handleClose = useCallback(() => {
        if (closeTimeout.current !== null) return;

        setIsOpen(false);
        closeTimeout.current = window.setTimeout(onClose, 700);
    }, [onClose]);

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => setIsOpen(true));
        return () => window.cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") handleClose();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            if (closeTimeout.current !== null) window.clearTimeout(closeTimeout.current);
        };
    }, [handleClose]);

  return (
    <div 
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ease-out ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
    >
        <button
            type="button"
            onClick={handleClose}
            aria-label="Close homework task"
            className="fixed top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-l-full bg-white text-slate-600  transition-colors hover:bg-slate-100 hover:text-slate-900 cursor-pointer lg:right-[min(100vw,56rem)]"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="homework-task-title"
            className={`absolute inset-y-0 right-0 flex w-full max-w-4xl flex-col overflow-hidden bg-white shadow-2xl will-change-transform transition-transform duration-700 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            onClick={(e) => e.stopPropagation()}
        >
            <div 
                className="flex items-center justify-between px-6 py-4 border-b border-slate-200"
            >
                <div>
                    <h2 id="homework-task-title" className="text-base font-semibold text-slate-900">
                        { task.title }
                    </h2>
                    <p className="text-xs text-slate-500">
                        { task.type === "quiz" ? "Quiz" : "Homework task"} . { task.maxScore } pts
                    </p>
                </div>
            </div>
            
            {/* for left: task detail */}
            <div className="flex flex-col flex-1 min-h-0 lg:flex-row">
                <aside className="w-full p-6 overflow-y-auto border-b border-slate-200 lg:w-1/2 lg:border-r lg:border-b-0">
                    <div className="space-y-5 text-sm">
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-[12px] font-medium border rounded-md ${statusStyles[task.status]}`}>
                                {task.status.replace("_", " ")}
                            </span>
                            <span
                                className="px-2 py-0.5 text-[12px] font-semibold uppercase rounded bg-slate-100 text-slate-600"
                            >
                                {task.type}
                            </span>
                        </div>
                        
                        { task.description && (
                            <div>
                                <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                                    Instructions
                                </h3>
                                <p className="mt-1 text-slate-700">
                                    { task.description}
                                </p>
                            </div>   
                        )}

                        <dl className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <dt className="text-slate-500">
                                    Due date
                                </dt>
                                <dd className="font-medium text-slate-800">
                                    {formatDate(task.dueDate)}
                                </dd>
                            </div>    
                            <div className="flex justify-between">
                                <dt className="text-slate-500 ">
                                    Submitted
                                </dt>
                                <dd className="font-medium text-slate-800 ">
                                    {task.submittedAt}
                                </dd>
                            </div>        
                            <div className="flex justify-between">
                                <dt className="text-slate-500">
                                    Score
                                </dt>
                                <dd className="font-mono font-medium text-slate-800">
                                    { task.status === "GRADED" && task.score !== undefined 
                                        ? `${task.score} / ${task.maxScore}`
                                        : "Not graded yet"
                                    }
                                </dd>
                            </div>                
                        </dl>
                        
                        { task.attachments && task.attachments.length > 0 && (
                            <div>
                                <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                                    Attachments
                                </h3>
                                <ul className="mt-1 space-y-1">
                                    { task.attachments.map((file) => (
                                      <li
                                        key={file}
                                        className="px-3 py-2 font-mono text-xs text-indigo-600 border rounded-lg bg-slate-50 border-slate-200"
                                      >
                                        {file}
                                      </li>  
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </aside>

                {/* for right side: chat */}
                <div className="flex flex-col w-full min-h-0 lg:w-1/2">
                    <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-200 bg-slate-50/60">
                        <div className="flex items-center justify-center text-sm font-bold text-white bg-indigo-600 rounded-full w-9 h-9">
                            {instructorName?.[0] ?? "M"}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">
                                { instructorName ?? "Mentor"}
                            </p>
                            <p className="text-xs text-slate-500">
                                Course instructor
                            </p>
                        </div>
                    </div>
                    <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                        { messages.map((message) => {
                            const isStudent = message.sender === "student";
                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isStudent ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                                            isStudent 
                                                ? "bg-indigo-600 text-white rounded-br-sm"
                                                : "bg-slate-100 text-slate-800 rounded-bl-sm"
                                        }`}
                                    >
                                        {message.text}
                                        <p
                                            className={`mt-1 text-[12px] text-end ${
                                                isStudent   ? "text-indigo-200" 
                                                            : "text-slate-400"
                                            }`}
                                        >
                                            
                                            { new Date(message.sentAt).toLocaleTimeString("en-GB", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                        
                                    </div>   
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* input message field */}
                    <div className="flex items-center gap-2 p-3 border-t border-slate-200">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend() }
                            placeholder="Write a message..."
                            className="flex-1 px-3 py-2 text-sm border rounded-lg bg-slate-50 border-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
