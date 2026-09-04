import type { Homework, HomeworkTask } from "../../types/course"
import { HomeworkRow } from "./HomeworkRow";

type HomeworkTableProps = {
    homeworks: Homework[];
    isLoading?: boolean;
    onTaskClick?: (task: HomeworkTask) => void;
};


export function HomeworkTable({ homeworks, isLoading, onTaskClick } : HomeworkTableProps ) {

    if( isLoading ) {
        return (
            <div className="p-12 text-sm font-medium text-center text-slate-400 animate-pulse">
                Loading homeworks...
            </div>
        );
    }

    if ( homeworks.length === 0 ){
        return (
            <div className="p-8 text-xs italic text-center text-slate-400 ">
                No homework available.
            </div>
        );
    }

  return (
    <div className="w-full bg-white text-slate-700">
        <div className="grid grid-cols-12 px-8 py-4 text-xs font-semibold border-b border-slate-200 text-slate-900">
            <div className="col-span-1">
                No.
            </div>
            <div className="col-span-6">
                Homework
            </div>
            <div className="col-span-2">
                Tasks
            </div>
            <div className="col-span-3 text-right">
                Overall Progress
            </div>
        </div>
        <div className="divide-y divide-slate-100">
            {
                homeworks.map(( homework, index ) => (
                    <HomeworkRow
                        key={homework.id}
                        homework={homework}
                        index={index}
                        onTaskClick={onTaskClick}
                    />
                ))
            }
        </div>
    </div>
  )
}
