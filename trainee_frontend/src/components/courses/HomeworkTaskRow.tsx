import type { HomeworkTask } from "../../types/course"

type HomeworkTaskRowProps = {
    task: HomeworkTask;
    homeworkIndex: number;
    taskIndex: number;
    onclick?: (task: HomeworkTask) => void;
};

const statusStyles: Record<string, string> = {
    GRADED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200",
    NOT_SUBMITTED: "bg-slate-100 text-slate-700 border-slate-200",
    LATE: "bg-red-50 text-red-700 border-red-200",
    DOING: "bg-amber-50 text-amber-600 border-amber-200",
    កិច្ចការថ្មី: "bg-slate-100 text-slate-700 border-slate-200",
    កំពុងធ្វើ: "bg-amber-50 text-amber-600 border-amber-200",
    ស្នើពិនិត្យ: "bg-blue-50 text-blue-700 border-blue-200",
    បញ្ចប់: "bg-emerald-50 text-emerald-700 border-emerald-200",
    យឺតយ៉ាវ: "bg-red-50 text-red-700 border-red-200",
};

const statusLabels: Record<string, string> = {
    NOT_SUBMITTED: "កិច្ចការថ្មី",
    SUBMITTED: "ស្នើពិនិត្យ",
    GRADED: "បញ្ចប់",
    LATE: "យឺតយ៉ាវ",
    DOING: "កំពុងធ្វើ",
    កិច្ចការថ្មី: "កិច្ចការថ្មី",
    កំពុងធ្វើ: "កំពុងធ្វើ",
    ស្នើពិនិត្យ: "ស្នើពិនិត្យ",
    បញ្ចប់: "បញ្ចប់",
    យឺតយ៉ាវ: "យឺតយ៉ាវ",
};

export function HomeworkTaskRow({task, homeworkIndex, taskIndex, onclick} : HomeworkTaskRowProps ) {
    return (
        <div
            onClick={() => onclick?.(task)}
            className="flex items-center justify-between p-3.5 text-sm transition-colors bg-white border rounded-lg cursor-pointer border-slate-200/60 hover:border-indigo-300 hover:shadow-sm"
        >
            <div className="flex items-center flex-1 min-w-0 gap-3">
                <span className="w-6 font-mono text-slate-400 text-sm font-normal">
                    { homeworkIndex + 1 }.{ taskIndex + 1 }
                </span>
                <div className="min-w-0">
                    <p className="text-base font-normal truncate text-slate-900 font-kantumruy">
                        {task.title}
                    </p>
                    { task.description && (
                        <p className="text-xs text-slate-500 font-normal truncate">
                            {task.description}
                        </p>   
                    )}
                </div>
            </div>

            <div className="flex items-center shrink-0">
                <span
                    className={`px-2.5 py-0.5 text-xs font-normal border rounded-md font-kantumruy ${
                        statusStyles[task.status] || "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                >
                    {statusLabels[task.status] || (typeof task.status === "string" ? task.status.replace(/_/g, " ") : "")}
                </span>
            </div>
        </div>
    )
}