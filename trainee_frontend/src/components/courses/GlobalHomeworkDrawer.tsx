import { useHomeworkDrawerStore } from "@/store/useHomeworkDrawerStore";
import { HomeworkTaskDialog } from "./HomeworkTaskDialog";

export function GlobalHomeworkDrawer() {
  const isOpen = useHomeworkDrawerStore((s) => s.isOpen);
  const data = useHomeworkDrawerStore((s) => s.data);
  const closeDrawer = useHomeworkDrawerStore((s) => s.closeDrawer);

  if (!isOpen || !data) return null;

  return (
    <HomeworkTaskDialog
      key={`global-hw-${data.taskId}`}
      taskId={data.taskId}
      task={data.task}
      onClose={closeDrawer}
    />
  );
}
