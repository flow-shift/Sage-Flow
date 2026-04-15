import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { HelpTooltip } from "@/components/HelpTooltip";

interface Task {
  id: string;
  title: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  createdAt: string;
}

const priorityStyles: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-600",
};

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const { toast } = useToast();

  useEffect(() => {
    setTasks(JSON.parse(localStorage.getItem("tasks") || "[]"));
  }, []);

  const save = (updated: Task[]) => {
    setTasks(updated);
    localStorage.setItem("tasks", JSON.stringify(updated));
  };

  const addTask = () => {
    if (!title.trim()) return;
    save([{ id: Date.now().toString(), title: title.trim(), priority, completed: false, createdAt: new Date().toISOString() }, ...tasks]);
    setTitle("");
    toast({ title: "Task added" });
  };

  const toggleTask = (id: string) => save(tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));
  const deleteTask = (id: string) => save(tasks.filter((t) => t.id !== id));

  const filtered = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-1">
          Tasks <HelpTooltip content="Create tasks with priority levels. Check them off when complete." />
        </h1>
        <p className="text-muted-foreground mt-1">Manage your study tasks and to-dos.</p>
      </div>

      <div className="border rounded-xl p-4 bg-card">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            placeholder="Add a new task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            className="flex-1 border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="flex gap-3">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button
              onClick={addTask}
              className="flex items-center gap-1 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {(["all", "active", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "border hover:bg-muted"}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="border rounded-xl p-8 text-center text-muted-foreground bg-card">No tasks found. Add one above!</div>
        )}
        {filtered.map((task) => (
          <div key={task.id} className={`border rounded-xl px-4 py-3 bg-card flex items-center gap-3 ${task.completed ? "opacity-60" : ""}`}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              className="w-4 h-4 accent-primary cursor-pointer"
            />
            <span className={`flex-1 text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>{task.title}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyles[task.priority]}`}>{task.priority}</span>
            <button onClick={() => deleteTask(task.id)} className="text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
