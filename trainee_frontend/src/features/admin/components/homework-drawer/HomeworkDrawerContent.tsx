import { useState, useEffect, useRef } from "react";
import {
  GripVertical,
  ClipboardList,
  FileText,
  HelpCircle,
  MoreVertical,
  Trash2,
  Edit2,
  Plus,
  Loader2,
  Calendar,
  Award,
  AlertTriangle,
} from "lucide-react";
import type { CourseCardItem, Homework, HomeworkTask } from "@/types/course";
import {
  getHomeworks,
  createHomeworkApi,
  updateHomeworkApi,
  deleteHomeworkApi,
  createHomeworkTaskApi,
  updateHomeworkTaskApi,
  deleteHomeworkTaskApi,
} from "@/services/homeworkService";
import { EditHomeworkDrawerContent } from "./EditHomeworkDrawerContent";
import { EditHomeworkTaskDrawerContent } from "./EditHomeworkTaskDrawerContent";
import { useToastStore } from "@/store/useToastStore";

interface HomeworkDrawerContentProps {
  course: CourseCardItem;
  selectedHomework: Homework | null;
  onSelectHomework: (homework: Homework | null) => void;
  selectedTask: HomeworkTask | null;
  onSelectTask: (task: HomeworkTask | null) => void;
  isAddHomeworkOpen: boolean;
  setIsAddHomeworkOpen: (open: boolean) => void;
  isAddTaskOpen: boolean;
  setIsAddTaskOpen: (open: boolean) => void;
  editingHomework: Homework | null;
  setEditingHomework: (homework: Homework | null) => void;
  editingTask: HomeworkTask | null;
  setEditingTask: (task: HomeworkTask | null) => void;
}

export function HomeworkDrawerContent({
  course,
  selectedHomework,
  onSelectHomework,
  selectedTask,
  onSelectTask,
  isAddHomeworkOpen,
  setIsAddHomeworkOpen,
  isAddTaskOpen,
  setIsAddTaskOpen,
  editingHomework,
  setEditingHomework,
  editingTask,
  setEditingTask,
}: HomeworkDrawerContentProps) {
  const showToast = useToastStore((s) => s.showToast);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);

  // 3-dot dropdown states
  const [activeHwMenuId, setActiveHwMenuId] = useState<string | number | null>(null);
  const [activeTaskMenuId, setActiveTaskMenuId] = useState<string | number | null>(null);
  const hwMenuRef = useRef<HTMLDivElement>(null);
  const taskMenuRef = useRef<HTMLDivElement>(null);

  // Delete modal states
  const [homeworkToDelete, setHomeworkToDelete] = useState<Homework | null>(null);
  const [isDeletingHw, setIsDeletingHw] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<HomeworkTask | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (hwMenuRef.current && !hwMenuRef.current.contains(e.target as Node)) {
        setActiveHwMenuId(null);
      }
      if (taskMenuRef.current && !taskMenuRef.current.contains(e.target as Node)) {
        setActiveTaskMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load homeworks
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getHomeworks(course.id);
      setHomeworks(data);
    } catch (err) {
      console.error("Failed to load homeworks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [course.id]);

  // Current active homework & task resolution
  const currentHomework = selectedHomework
    ? homeworks.find((h) => String(h.id) === String(selectedHomework.id)) || selectedHomework
    : null;

  const currentTask = selectedTask && currentHomework
    ? currentHomework.tasks?.find((t) => String(t.id) === String(selectedTask.id)) || selectedTask
    : selectedTask;

  // Handlers for Homework CRUD
  const handleCreateHomework = async (data: { title: string; description?: string }) => {
    try {
      const created = await createHomeworkApi(course.id, data.title, data.description);
      setHomeworks((prev) => [...prev, created]);
      showToast("បានបន្ថែមដំណាក់កិច្ចការផ្ទះជោគជ័យ!", "success");
    } catch (err) {
      console.error("Failed to create homework:", err);
      showToast("បរាជ័យក្នុងការបន្ថែមដំណាក់កិច្ចការផ្ទះ", "error");
    } finally {
      setIsAddHomeworkOpen(false);
    }
  };

  const handleUpdateHomework = async (data: { title: string; description?: string }) => {
    if (!editingHomework) return;
    try {
      const updated = await updateHomeworkApi(editingHomework.id, data);
      setHomeworks((prev) =>
        prev.map((h) => (String(h.id) === String(editingHomework.id) ? { ...h, ...updated } : h))
      );
      if (selectedHomework && String(selectedHomework.id) === String(editingHomework.id)) {
        onSelectHomework({ ...selectedHomework, ...updated });
      }
      showToast("កែប្រែកិច្ចការផ្ទះជោគជ័យ!", "success");
    } catch (err) {
      console.error("Failed to update homework:", err);
      showToast("បរាជ័យក្នុងការកែប្រែកិច្ចការផ្ទះ", "error");
    } finally {
      setEditingHomework(null);
    }
  };

  const handleDeleteHomework = async () => {
    if (!homeworkToDelete) return;
    try {
      setIsDeletingHw(true);
      await deleteHomeworkApi(homeworkToDelete.id);
      setHomeworks((prev) => prev.filter((h) => String(h.id) !== String(homeworkToDelete.id)));
      if (selectedHomework && String(selectedHomework.id) === String(homeworkToDelete.id)) {
        onSelectHomework(null);
        onSelectTask(null);
      }
      showToast("បានលុបកិច្ចការផ្ទះជោគជ័យ!", "success");
    } catch (err) {
      console.error("Failed to delete homework:", err);
      showToast("បរាជ័យក្នុងការលុបកិច្ចការផ្ទះ", "error");
    } finally {
      setIsDeletingHw(false);
      setHomeworkToDelete(null);
    }
  };

  // Handlers for Task CRUD
  const handleCreateTask = async (data: any) => {
    if (!currentHomework) return;
    try {
      const created = await createHomeworkTaskApi(currentHomework.id, data);
      setHomeworks((prev) =>
        prev.map((h) =>
          String(h.id) === String(currentHomework.id)
            ? { ...h, tasks: [...(h.tasks || []), created] }
            : h
        )
      );
      showToast("បានបន្ថែមភារកិច្ចជោគជ័យ!", "success");
    } catch (err) {
      console.error("Failed to create task:", err);
      showToast("បរាជ័យក្នុងការបន្ថែមភារកិច្ច", "error");
    } finally {
      setIsAddTaskOpen(false);
    }
  };

  const handleUpdateTask = async (data: any) => {
    if (!editingTask) return;
    try {
      const updated = await updateHomeworkTaskApi(editingTask.id, data);
      setHomeworks((prev) =>
        prev.map((h) =>
          String(h.id) === String(currentHomework?.id)
            ? {
                ...h,
                tasks: (h.tasks || []).map((t) =>
                  String(t.id) === String(editingTask.id) ? { ...t, ...updated } : t
                ),
              }
            : h
        )
      );
      if (selectedTask && String(selectedTask.id) === String(editingTask.id)) {
        onSelectTask({ ...selectedTask, ...updated });
      }
      showToast("កែប្រែភារកិច្ចជោគជ័យ!", "success");
    } catch (err) {
      console.error("Failed to update task:", err);
      showToast("បរាជ័យក្នុងការកែប្រែភារកិច្ច", "error");
    } finally {
      setEditingTask(null);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      setIsDeletingTask(true);
      await deleteHomeworkTaskApi(taskToDelete.id);
      setHomeworks((prev) =>
        prev.map((h) =>
          String(h.id) === String(currentHomework?.id)
            ? { ...h, tasks: (h.tasks || []).filter((t) => String(t.id) !== String(taskToDelete.id)) }
            : h
        )
      );
      if (selectedTask && String(selectedTask.id) === String(taskToDelete.id)) {
        onSelectTask(null);
      }
      showToast("បានលុបភារកិច្ចជោគជ័យ!", "success");
    } catch (err) {
      console.error("Failed to delete task:", err);
      showToast("បរាជ័យក្នុងការលុបភារកិច្ច", "error");
    } finally {
      setIsDeletingTask(false);
      setTaskToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 h-64 text-slate-400 font-kantumruy">
        <Loader2 className="w-7 h-7 animate-spin text-cyan-600 mb-2" />
        <span className="text-sm">កំពុងផ្ទុកកិច្ចការផ្ទះ (Loading Homeworks)...</span>
      </div>
    );
  }

  // =========================================================================
  // SUB-DRAWER: Add Homework View
  // =========================================================================
  if (isAddHomeworkOpen) {
    return (
      <EditHomeworkDrawerContent
        onSave={handleCreateHomework}
        onCancel={() => setIsAddHomeworkOpen(false)}
      />
    );
  }

  // =========================================================================
  // SUB-DRAWER: Edit Homework View
  // =========================================================================
  if (editingHomework) {
    return (
      <EditHomeworkDrawerContent
        homework={editingHomework}
        onSave={handleUpdateHomework}
        onCancel={() => setEditingHomework(null)}
      />
    );
  }

  // =========================================================================
  // SUB-DRAWER: Add Task View
  // =========================================================================
  if (isAddTaskOpen && currentHomework) {
    return (
      <EditHomeworkTaskDrawerContent
        onSave={handleCreateTask}
        onCancel={() => setIsAddTaskOpen(false)}
      />
    );
  }

  // =========================================================================
  // SUB-DRAWER: Edit Task View
  // =========================================================================
  if (editingTask) {
    return (
      <EditHomeworkTaskDrawerContent
        task={editingTask}
        onSave={handleUpdateTask}
        onCancel={() => setEditingTask(null)}
      />
    );
  }

  // =========================================================================
  // LEVEL 3: TASK DETAIL VIEW
  // =========================================================================
  if (currentTask) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 font-kantumruy space-y-6">
        {/* Section 1: Overview & Instructions */}
        <section className="p-5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              ការណែនាំ (Instructions)
            </h4>
            <button
              type="button"
              onClick={() => setEditingTask(currentTask)}
              className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-cyan-50 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              កែប្រែ
            </button>
          </div>
          <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
            {currentTask.description || "មិនមានការណែនាំបន្ថែមសម្រាប់ភារកិច្ចនេះទេ។"}
          </p>
        </section>

        {/* Section 2: Task Metadata Cards */}
        <section className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded-xl border-slate-200/80 bg-white shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1.5">
              <Award className="w-4 h-4 text-cyan-600" />
              ពិន្ទុអតិបរមា (Max Score)
            </div>
            <span className="text-xl font-bold text-slate-800">
              {currentTask.maxScore} pts
            </span>
          </div>

          <div className="p-4 border rounded-xl border-slate-200/80 bg-white shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1.5">
              <Calendar className="w-4 h-4 text-cyan-600" />
              កាលបរិច្ឆេទកំណត់ (Due Date)
            </div>
            <span className="text-sm font-semibold text-slate-800">
              {currentTask.dueDate
                ? new Date(currentTask.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "គ្មានកាលកំណត់"}
            </span>
          </div>
        </section>

        {/* Section 3: Type & Requirements */}
        <section className="p-4 rounded-xl border border-slate-100 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentTask.type === "quiz" ? (
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <HelpCircle className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600">
                  <FileText className="w-5 h-5" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {currentTask.type === "quiz" ? "Quiz (កម្រងសំណួរ)" : "Assignment (កិច្ចការអនុវត្ត)"}
                </p>
                <p className="text-xs text-slate-400">
                  {currentTask.type === "quiz"
                    ? "Requires answering questions online"
                    : "Requires submitting project artifacts / code"}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 uppercase">
              {currentTask.type}
            </span>
          </div>
        </section>
      </div>
    );
  }

  // =========================================================================
  // LEVEL 2: TASKS LIST IN SELECTED HOMEWORK
  // =========================================================================
  if (currentHomework) {
    const tasks = currentHomework.tasks || [];

    return (
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 font-kantumruy">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#60738d]">Tasks</h3>
          <span className="text-xs text-slate-400 font-medium">
            {tasks.length} tasks
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-cyan-50 text-cyan-600 mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-1">
              មិនទាន់មានភារកិច្ចក្នុងកិច្ចការផ្ទះនេះទេ
            </p>
            <p className="text-xs text-slate-400 mb-4 text-center max-w-xs">
              No tasks yet in this homework. Click below to add the first task.
            </p>
            <button
              type="button"
              onClick={() => setIsAddTaskOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-lg bg-cyan-600 hover:bg-cyan-700 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>បន្ថែមភារកិច្ច (Add Task)</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 border-t border-b border-slate-100">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className={`group flex items-center justify-between py-3.5 px-2 hover:bg-slate-50 transition-colors rounded-lg cursor-pointer relative ${
                  activeTaskMenuId === task.id ? "bg-slate-50" : ""
                }`}
              >
                {/* Left Side: Drag Grip + Icon + Title */}
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-400 shrink-0 cursor-grab" />
                  {task.type === "quiz" ? (
                    <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-cyan-600 shrink-0" />
                  )}
                  <span className="text-sm font-medium text-slate-700 truncate">
                    {task.title}
                  </span>
                </div>

                {/* Right Side: Score badge & 3-Dots Action Button */}
                <div className="flex items-center gap-4 shrink-0 text-xs text-slate-400">
                  <span className="font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {task.maxScore} pts
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTaskMenuId(activeTaskMenuId === task.id ? null : task.id);
                    }}
                    className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* 3-dot dropdown */}
                  {activeTaskMenuId === task.id && (
                    <div
                      ref={taskMenuRef}
                      className="absolute right-6 top-10 w-36 bg-white border border-slate-100 rounded-lg shadow-xl py-1 z-30 font-kantumruy"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTaskMenuId(null);
                          setEditingTask(task);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-cyan-600" />
                        កែប្រែ (Edit)
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTaskMenuId(null);
                          setTaskToDelete(task);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        លុប (Delete)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Task Confirmation Modal */}
        {taskToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="w-full max-w-sm p-6 bg-white rounded-2xl shadow-xl font-kantumruy animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 text-red-600 mb-3">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h4 className="font-bold text-base">លុបភារកិច្ច</h4>
              </div>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                តើអ្នកប្រាកដជាចង់លុប "{taskToDelete.title}" ដែរឬទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  disabled={isDeletingTask}
                  onClick={() => setTaskToDelete(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  បោះបង់
                </button>
                <button
                  type="button"
                  disabled={isDeletingTask}
                  onClick={handleDeleteTask}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 shadow-sm transition-colors"
                >
                  {isDeletingTask && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>លុប</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // LEVEL 1: HOMEWORKS LIST
  // =========================================================================
  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 font-kantumruy">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[#60738d]">Homeworks</h3>
        <span className="text-xs text-slate-400 font-medium">
          {homeworks.length} homeworks
        </span>
      </div>

      {homeworks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-cyan-50 text-cyan-600 mb-3">
            <ClipboardList className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-1">
            មិនទាន់មានកិច្ចការផ្ទះនៅឡើយទេ
          </p>
          <p className="text-xs text-slate-400 mb-4 text-center max-w-xs">
            No homework yet. Click below to add the first homework module.
          </p>
          <button
            type="button"
            onClick={() => setIsAddHomeworkOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-lg bg-cyan-600 hover:bg-cyan-700 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>បន្ថែម (Add Homework)</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100 border-t border-b border-slate-100">
          {homeworks.map((hw) => (
            <div
              key={hw.id}
              onClick={() => onSelectHomework(hw)}
              className={`group flex items-center justify-between py-4 px-2 hover:bg-slate-50 transition-colors rounded-lg cursor-pointer relative ${
                activeHwMenuId === hw.id ? "bg-slate-50" : ""
              }`}
            >
              {/* Left: Grip + Title */}
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-400 shrink-0 cursor-grab" />
                <span className="text-sm font-md text-slate-800 truncate">
                  {hw.title}
                </span>
              </div>

              {/* Right: Task Count & 3-Dots Menu */}
              <div className="flex items-center gap-4 shrink-0 text-xs text-slate-400">
                <span className="font-medium text-slate-500">
                  {hw.tasks?.length || 0} tasks
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHwMenuId(activeHwMenuId === hw.id ? null : hw.id);
                  }}
                  className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* 3-dot dropdown */}
                {activeHwMenuId === hw.id && (
                  <div
                    ref={hwMenuRef}
                    className="absolute right-6 top-10 w-36 bg-white border border-slate-100 rounded-lg shadow-xl py-1 z-30 font-kantumruy"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveHwMenuId(null);
                        setEditingHomework(hw);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-cyan-600" />
                      កែប្រែ (Edit)
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveHwMenuId(null);
                        setHomeworkToDelete(hw);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      លុប (Delete)
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Homework Confirmation Modal */}
      {homeworkToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-sm p-6 bg-white rounded-2xl shadow-xl font-kantumruy animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h4 className="font-bold text-base">លុបកិច្ចការផ្ទះ</h4>
            </div>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              តើអ្នកប្រាកដជាចង់លុប "{homeworkToDelete.title}" ដែរឬទេ? ភារកិច្ចទាំងអស់ក្នុងកិច្ចការនេះនឹងត្រូវបាត់បង់។
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={isDeletingHw}
                onClick={() => setHomeworkToDelete(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
              >
                បោះបង់
              </button>
              <button
                type="button"
                disabled={isDeletingHw}
                onClick={handleDeleteHomework}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 shadow-sm transition-colors"
              >
                {isDeletingHw && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>លុប</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
