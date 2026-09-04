import type { HomeworkStatus, HomeworkTask } from "../../types/course"

type HomeworkTaskRowProps = {
    task: HomeworkTask;
    homeworkIndex: number;
    taskIndex: number;
    onclick?: (task: HomeworkTask) => void;
};

const statusStyles: Record<HomeworkStatus, string> = {
   GRADED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    SUBMITTED: "bg-indigo-50 text-indigo-700 border-indigo-200",
    NOT_SUBMITTED: "bg-slate-100 text-slate-500 border-slate-200",
    LATE: "bg-red-50 text-red-700 border-red-200",
};

function formatDate( date?: string ): string {
    if( !date ) return "__";
    return new Date(date).toLocaleDateString("en-GB");
}

export function HomeworkTaskRow({task, homeworkIndex, taskIndex, onclick} : HomeworkTaskRowProps ) {
    return (
        <div
            onClick={() => onclick?.(task)}
            className="flex items-center justify-between p-3 text-xs transition-colors bg-white border rounded-lg cursor-pointer border-slate-200/60 hover:border-indigo-300 hover:shadow-sm"
        >
            <div className="flex items-center flex-1 min-w-0 gap-3">
                <span className="w-6 font-mono text-slate-400">
                    { homeworkIndex + 1 }.{ taskIndex + 1 }
                </span>
                <div className="min-w-0">
                    <p className="font-medium truncate text-slate-800">
                        {task.title}
                    </p>
                    { task.description && (
                        <p className="text-[12px] text-slate-400 truncate">
                            {task.description}
                        </p>   
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 ">
                <span className="px-2 py-0.5 text-[12px] font-semibold uppercase rounded bg-slate-100 text-slate-600">
                    {task.type}
                </span>
                <span  className="font-mono text-[11px] text-slate-400">
                    {formatDate(task.dueDate)}
                </span>
                <span
                    className={`px-2 py-0.5 text-[12px] font-medium border rounded-md ${statusStyles[task.status]}`}
                >
                    {task.status.replace("__", " ")}
                </span>
                <span>
                    { task.status === "GRADED" && task.score !== undefined 
                        ? `${task.score} / ${task.maxScore}`
                        : "__"
                    }
                </span>
            </div>
        </div>
    )
}