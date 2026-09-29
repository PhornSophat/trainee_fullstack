import { useState } from "react";
import type { Homework, HomeworkTask } from "../../types/course";
import { HomeworkTaskRow } from "./HomeworkTaskRow";

type HomeworkRowProps = {
    homework: Homework;
    index: number;
    onTaskClick?: (task: HomeworkTask) => void;
};

const getTaskProgressPercentage = (status?: string): number => {
    switch (status) {
        case "GRADED":
        case "បញ្ចប់":
        case "DONE":
        case "COMPLETED":
            return 100;
        case "SUBMITTED":
        case "ស្នើពិនិត្យ":
            return 50;
        case "DOING":
        case "កំពុងធ្វើ":
        case "IN_PROGRESS":
            return 25;
        case "NOT_SUBMITTED":
        case "កិច្ចការថ្មី":
        case "LATE":
        case "យឺតយ៉ាវ":
        default:
            return 0;
    }
};

export function HomeworkRow({ homework, index, onTaskClick }: HomeworkRowProps) {

    const [ isExpanded, setIsExpanded ] = useState(false);

    const tasks = homework.tasks || [];
    const totalProgress = tasks.reduce(
        (sum, task) => sum + getTaskProgressPercentage(task.status),
        0
    );
    const progress = tasks.length > 0 ? Math.round(totalProgress / tasks.length) : 0;

  return (
    <div className="transition-colors bg-white">
        <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="grid items-center w-full grid-cols-12 px-8 py-4 text-base font-normal text-left transition-colors cursor-pointer hover:bg-slate-50"
        >
            <div className="col-span-1 text-base font-normal text-slate-400">
                {index + 1}
            </div>   
            <div className="flex items-center col-span-6 gap-2 pr-4">
                 <svg
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isExpanded ? "rotate-90 text-indigo-600" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <div className="min-w-0">
                    <span className="text-base font-normal text-slate-900 font-kantumruy">
                        {homework.title}
                    </span>
                    {
                        homework.description && (
                            <p className="text-xs truncate text-slate-500 font-normal">
                                {homework.description}
                            </p>
                        )
                    }
                </div>
            </div>

            <div className="col-span-2 text-sm font-normal text-slate-500">
                {tasks.length} tasks
            </div>
                    
            <div className="flex items-center justify-end col-span-3 gap-3">
                 <div className="w-24 h-2 overflow-hidden border rounded-full bg-slate-100 border-slate-200/60">
                    <div
                        className={`h-full transition-all duration-300 ${
                            progress === 100
                            ? "bg-emerald-500"
                            : progress > 0
                            ? "bg-indigo-500"
                            : "bg-transparent"
                        }`}
                        style={{ width: `${progress}%` }}
                    />
                 </div>
                 <span className="text-sm font-normal text-slate-600 min-w-[36px] text-right font-mono">
                    {progress}%
                 </span>
            </div>
        </button>

        {
            isExpanded && (
                <div className="py-3 pl-16 pr-8 space-y-2 border-t bg-slate-50/50 border-slate-100">
                    {
                        tasks.map((task, taskIndex) => (
                            <HomeworkTaskRow
                                key={task.id}
                                task={task}
                                homeworkIndex={index}
                                taskIndex={taskIndex}
                                onclick={onTaskClick}
                            />
                        ))
                    }
                </div>
            )
        }
    </div>
  )
}
