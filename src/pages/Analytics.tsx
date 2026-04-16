import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(168,70%,38%)", "hsl(43,96%,56%)", "hsl(262,60%,55%)", "hsl(200,70%,50%)", "hsl(340,65%,55%)"];

const Analytics = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [studySchedule, setStudySchedule] = useState<any[]>([]);
  const [aptitudeScores, setAptitudeScores] = useState<any[]>([]);

  useEffect(() => {
    setTasks(JSON.parse(localStorage.getItem("tasks") || "[]"));
    setStudySchedule(JSON.parse(localStorage.getItem("studySchedule") || "[]"));
    setAptitudeScores(JSON.parse(localStorage.getItem("aptitudeScores") || "[]"));
  }, []);

  const completed = tasks.filter((t) => t.completed).length;
  const taskPieData = [{ name: "Completed", value: completed }, { name: "Active", value: tasks.length - completed }];
  const priorityData = [
    { name: "Low", count: tasks.filter((t) => t.priority === "low").length },
    { name: "Medium", count: tasks.filter((t) => t.priority === "medium").length },
    { name: "High", count: tasks.filter((t) => t.priority === "high").length },
  ];

  const studyBySubject: Record<string, number> = {};
  studySchedule.forEach((e: any) => { studyBySubject[e.subjectName] = (studyBySubject[e.subjectName] || 0) + e.hours; });
  const studyData = Object.entries(studyBySubject).map(([name, hours]) => ({ name, hours }));

  const card = "border rounded-xl p-5 bg-card shadow-sm";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your progress and performance.</p>
      </div>

      {tasks.length === 0 && studySchedule.length === 0 ? (
        <div className={`${card} py-12 text-center text-muted-foreground`}>
          No data yet. Add tasks or create a study plan to see analytics.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={card}>
            <p className="font-medium mb-4">Task Status</p>
            {tasks.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={taskPieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {taskPieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground py-8">No tasks yet</p>}
          </div>

          <div className={card}>
            <p className="font-medium mb-4">Tasks by Priority</p>
            {tasks.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS[0]} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground py-8">No tasks yet</p>}
          </div>

          <div className={`${card} lg:col-span-2`}>
            <p className="font-medium mb-4">Study Hours by Subject</p>
            {studyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={studyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="hours" fill={COLORS[1]} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground py-8">No study plan yet</p>}
          </div>

          {aptitudeScores.length > 0 && (
            <div className={`${card} lg:col-span-2`}>
              <p className="font-medium mb-1">Daily Aptitude Performance</p>
              <p className="text-xs text-muted-foreground mb-4">{aptitudeScores.filter((a) => a.correct).length} correct out of {aptitudeScores.length} attempts</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={aptitudeScores.slice(-14).map((a) => ({ date: a.date.slice(5), result: a.correct ? 1 : 0 }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} domain={[0, 1]} ticks={[0, 1]} tickFormatter={(v) => v === 1 ? "✓" : "✗"} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => v === 1 ? "Correct" : "Wrong"} />
                  <Bar dataKey="result" fill={COLORS[2]} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;
