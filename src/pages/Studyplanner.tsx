import { useState, useEffect, useCallback } from "react";
import { format, differenceInDays, addDays, isToday, isBefore, startOfDay } from "date-fns";
import { Plus, Trash2, GripVertical, RotateCcw, BookOpen, Clock, AlertTriangle, Printer, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { HelpTooltip } from "@/components/HelpTooltip";
import { gemini } from "@/lib/firebase";

interface Topic { id: string; name: string; hoursNeeded: number; }
interface Subject { id: string; name: string; topics: Topic[]; examDate: Date; color: string; }
interface ScheduleEntry { id: string; subjectId: string; subjectName: string; topicId: string; topicName: string; date: string; hours: number; completed: boolean; color: string; }

const SUBJECT_COLORS = ["hsl(168,70%,38%)", "hsl(262,60%,55%)", "hsl(43,96%,56%)", "hsl(200,70%,50%)", "hsl(340,65%,55%)", "hsl(25,80%,55%)"];
const COLOR_CLASSES = ["bg-primary/15 border-primary/30 text-primary", "bg-purple-100 border-purple-300 text-purple-700", "bg-yellow-100 border-yellow-300 text-yellow-700", "bg-blue-100 border-blue-300 text-blue-700", "bg-pink-100 border-pink-300 text-pink-700", "bg-orange-100 border-orange-300 text-orange-700"];

const StudyPlanner = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [hoursPerDay, setHoursPerDay] = useState(4);
  const [newSubject, setNewSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  // Per-subject topic inputs
  const [topicInputs, setTopicInputs] = useState<Record<string, { name: string; hours: string }>>({});
  const [dragItem, setDragItem] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("studySubjects");
    const storedSchedule = localStorage.getItem("studySchedule");
    const storedHours = localStorage.getItem("studyHoursPerDay");
    if (stored) setSubjects(JSON.parse(stored).map((s: any) => ({ ...s, examDate: new Date(s.examDate) })));
    if (storedSchedule) setSchedule(JSON.parse(storedSchedule));
    if (storedHours) setHoursPerDay(parseInt(storedHours));
  }, []);

  const save = useCallback((subs: Subject[], sched: ScheduleEntry[], hours: number) => {
    localStorage.setItem("studySubjects", JSON.stringify(subs));
    localStorage.setItem("studySchedule", JSON.stringify(sched));
    localStorage.setItem("studyHoursPerDay", hours.toString());
  }, []);

  const getTopicInput = (id: string) => topicInputs[id] || { name: "", hours: "2" };
  const setTopicInput = (id: string, field: "name" | "hours", value: string) =>
    setTopicInputs((prev) => ({ ...prev, [id]: { ...getTopicInput(id), [field]: value } }));

  const addSubject = () => {
    if (!newSubject.trim() || !examDate) {
      toast({ title: "Missing info", description: "Enter subject name and exam date", variant: "destructive" });
      return;
    }
    const sub: Subject = {
      id: crypto.randomUUID(),
      name: newSubject.trim(),
      topics: [],
      examDate: new Date(examDate),
      color: SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length],
    };
    const updated = [...subjects, sub];
    setSubjects(updated); save(updated, schedule, hoursPerDay);
    setNewSubject(""); setExamDate("");
    toast({ title: "Subject added" });
  };

  const removeSubject = (id: string) => {
    const updated = subjects.filter((s) => s.id !== id);
    const updatedSchedule = schedule.filter((e) => e.subjectId !== id);
    setSubjects(updated); setSchedule(updatedSchedule); save(updated, updatedSchedule, hoursPerDay);
  };

  const addTopic = (subjectId: string) => {
    const input = getTopicInput(subjectId);
    if (!input.name.trim()) { toast({ title: "Enter a topic name", variant: "destructive" }); return; }
    const topic: Topic = { id: crypto.randomUUID(), name: input.name.trim(), hoursNeeded: parseFloat(input.hours) || 2 };
    const updated = subjects.map((s) => s.id === subjectId ? { ...s, topics: [...s.topics, topic] } : s);
    setSubjects(updated); save(updated, schedule, hoursPerDay);
    setTopicInputs((prev) => ({ ...prev, [subjectId]: { name: "", hours: "2" } }));
    toast({ title: `Topic "${topic.name}" added` });
  };

  const removeTopic = (subjectId: string, topicId: string) => {
    const updated = subjects.map((s) => s.id === subjectId ? { ...s, topics: s.topics.filter((t) => t.id !== topicId) } : s);
    const updatedSchedule = schedule.filter((e) => e.topicId !== topicId);
    setSubjects(updated); setSchedule(updatedSchedule); save(updated, updatedSchedule, hoursPerDay);
  };

  const generateWithAI = async () => {
    const allTopics = subjects.flatMap((s) => s.topics.map((t) => ({
      subject: s.name,
      topic: t.name,
      examDate: format(s.examDate, "yyyy-MM-dd"),
      daysLeft: differenceInDays(s.examDate, startOfDay(new Date())),
    })));

    if (!allTopics.length) {
      toast({ title: "No topics", description: "Add subjects and topics first", variant: "destructive" });
      return;
    }

    setAiLoading(true);
    try {
      const prompt = `You are a smart study planner. Given the following subjects, topics, and exam dates, suggest how many study hours each topic needs based on its complexity and urgency.

Today's date: ${format(new Date(), "yyyy-MM-dd")}
Study hours available per day: ${hoursPerDay}

Topics:
${allTopics.map((t) => `- Subject: ${t.subject}, Topic: ${t.topic}, Exam date: ${t.examDate}, Days left: ${t.daysLeft}`).join("\n")}

Rules:
- Assign more hours to complex/important topics
- Assign more hours to topics with fewer days left
- Hours per topic should be between 1 and 10
- Return ONLY a valid JSON array, no extra text

Format:
[
  { "subject": "subject name", "topic": "topic name", "hours": 3 }
]`;

      const result = await gemini.generateContent(prompt);
      const text = result.response.text().trim();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Invalid response");

      const suggestions: { subject: string; topic: string; hours: number }[] = JSON.parse(jsonMatch[0]);

      // Apply AI suggestions to topics
      const updated = subjects.map((s) => ({
        ...s,
        topics: s.topics.map((t) => {
          const suggestion = suggestions.find(
            (sg) => sg.subject.toLowerCase() === s.name.toLowerCase() &&
                    sg.topic.toLowerCase() === t.name.toLowerCase()
          );
          return suggestion ? { ...t, hoursNeeded: suggestion.hours } : t;
        }),
      }));

      setSubjects(updated);
      save(updated, schedule, hoursPerDay);
      toast({ title: "AI suggestions applied!", description: "Topic hours updated based on complexity and urgency" });

      // Auto generate schedule after AI suggestions
      generateScheduleFromSubjects(updated);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Couldn't generate AI plan", description: "Please check your internet connection and try again.", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const generateScheduleFromSubjects = (subs: Subject[]) => {
    const allTopics = subs.flatMap((s) => s.topics.map((t) => ({ ...t, subjectId: s.id, subjectName: s.name, examDate: s.examDate, color: s.color })));
    if (!allTopics.length) return;
    allTopics.sort((a, b) => a.examDate.getTime() - b.examDate.getTime());
    const entries: ScheduleEntry[] = [];
    const today = startOfDay(new Date());
    const dateHoursUsed: Record<string, number> = {};
    const topicRemainingHours = new Map(allTopics.map((t) => [t.id, t.hoursNeeded]));
    let topicIndex = 0, currentDay = today, daysProcessed = 0;
    while (topicRemainingHours.size > 0 && daysProcessed < 365) {
      const dateKey = format(currentDay, "yyyy-MM-dd");
      const usedHours = dateHoursUsed[dateKey] || 0;
      if (usedHours >= hoursPerDay) { currentDay = addDays(currentDay, 1); daysProcessed++; continue; }
      let attempts = 0, foundTopic = false;
      while (attempts < allTopics.length && !foundTopic) {
        const topic = allTopics[topicIndex % allTopics.length];
        const remaining = topicRemainingHours.get(topic.id) || 0;
        if (remaining > 0 && differenceInDays(currentDay, topic.examDate) < 0) {
          const allocated = Math.min(remaining, hoursPerDay - usedHours, 2);
          entries.push({ id: crypto.randomUUID(), subjectId: topic.subjectId, subjectName: topic.subjectName, topicId: topic.id, topicName: topic.name, date: dateKey, hours: Math.round(allocated * 10) / 10, completed: false, color: topic.color });
          dateHoursUsed[dateKey] = usedHours + allocated;
          const newRemaining = remaining - allocated;
          if (newRemaining <= 0) topicRemainingHours.delete(topic.id);
          else topicRemainingHours.set(topic.id, newRemaining);
          foundTopic = true;
        }
        topicIndex++; attempts++;
      }
      if (!foundTopic) { currentDay = addDays(currentDay, 1); daysProcessed++; }
    }
    setSchedule(entries); save(subs, entries, hoursPerDay);
    toast({ title: "Schedule generated!", description: `${entries.length} AI-optimized study sessions planned` });
  };

  const generateSchedule = () => generateScheduleFromSubjects(subjects);

  const toggleCompleted = (entryId: string) => {
    const updated = schedule.map((e) => e.id === entryId ? { ...e, completed: !e.completed } : e);
    setSchedule(updated); save(subjects, updated, hoursPerDay);
  };

  const rescheduleMissed = () => {
    const today = startOfDay(new Date());
    const missed = schedule.filter((e) => !e.completed && isBefore(new Date(e.date), today));
    if (!missed.length) { toast({ title: "No missed sessions" }); return; }
    const dateHoursUsed: Record<string, number> = {};
    const kept = schedule.filter((e) => e.completed || !isBefore(new Date(e.date), today));
    kept.forEach((e) => { dateHoursUsed[e.date] = (dateHoursUsed[e.date] || 0) + e.hours; });
    const rescheduled: ScheduleEntry[] = [];
    for (const entry of missed) {
      let placed = false, tryDay = today;
      for (let attempt = 0; attempt < 60 && !placed; attempt++) {
        const dateKey = format(tryDay, "yyyy-MM-dd");
        const used = dateHoursUsed[dateKey] || 0;
        if (used + entry.hours <= hoursPerDay) {
          rescheduled.push({ ...entry, id: crypto.randomUUID(), date: dateKey });
          dateHoursUsed[dateKey] = used + entry.hours;
          placed = true;
        }
        tryDay = addDays(tryDay, 1);
      }
    }
    const updated = [...kept, ...rescheduled];
    setSchedule(updated); save(subjects, updated, hoursPerDay);
    toast({ title: "Rescheduled!", description: `${rescheduled.length} sessions moved forward` });
  };

  const today = startOfDay(new Date());
  const timetableDays = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(today, i);
    return { date, key: format(date, "yyyy-MM-dd"), label: format(date, "EEE"), dayNum: format(date, "d MMM") };
  });
  const missedCount = schedule.filter((e) => !e.completed && isBefore(new Date(e.date), today)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-1">
            Study Planner <HelpTooltip content="Add subjects with exam dates, then add topics. Click 'Generate Study Plan' to auto-create your schedule." />
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Plan your study schedule across subjects and topics.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {missedCount > 0 && (
            <button onClick={rescheduleMissed} className="flex items-center gap-2 border rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted transition-colors bg-white dark:bg-card">
              <AlertTriangle className="w-4 h-4 text-yellow-500" /> Reschedule {missedCount} missed
            </button>
          )}
          {schedule.length > 0 && (
            <button onClick={() => window.print()} className="flex items-center gap-2 border rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted transition-colors bg-white dark:bg-card">
              <Printer className="w-4 h-4" /> Print
            </button>
          )}
        </div>
      </div>

      {/* Add Subject */}
      <div className="border rounded-xl p-5 bg-white dark:bg-card shadow-sm space-y-3">
        <p className="font-semibold flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /> Add Subject</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            placeholder="Subject name (e.g. Mathematics)"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSubject()}
            className="flex-1 border rounded-lg px-3 py-2 text-sm bg-white dark:bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            min={format(today, "yyyy-MM-dd")}
            className="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button onClick={addSubject} className="flex items-center gap-1 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {/* Subjects & Topics */}
      {subjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((sub) => {
            const input = getTopicInput(sub.id);
            return (
              <div key={sub.id} className="border-l-4 border rounded-xl p-4 bg-white dark:bg-card shadow-sm space-y-3" style={{ borderLeftColor: sub.color }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{sub.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(sub.examDate, "PP")} · {differenceInDays(sub.examDate, today)} days · {sub.topics.length} topics
                    </p>
                  </div>
                  <button onClick={() => removeSubject(sub.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {sub.topics.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/50">
                    <span className="text-sm">{t.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{t.hoursNeeded}h</span>
                      <button onClick={() => removeTopic(sub.id, t.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <input
                    placeholder="Topic name"
                    value={input.name}
                    onChange={(e) => setTopicInput(sub.id, "name", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTopic(sub.id)}
                    className="flex-1 border rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <input
                    type="number"
                    placeholder="Hrs"
                    value={input.hours}
                    onChange={(e) => setTopicInput(sub.id, "hours", e.target.value)}
                    className="w-16 border rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button onClick={() => addTopic(sub.id)} className="bg-primary text-primary-foreground border rounded-lg px-3 py-1.5 text-sm hover:bg-primary/90 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Generate */}
      {subjects.some((s) => s.topics.length > 0) && (
        <div className="border rounded-xl p-5 bg-white dark:bg-card shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium whitespace-nowrap"><Clock className="w-4 h-4 inline mr-1" />Study hours/day:</label>
              <input
                type="number" min={1} max={12} value={hoursPerDay}
                onChange={(e) => { const v = parseInt(e.target.value) || 4; setHoursPerDay(v); save(subjects, schedule, v); }}
                className="w-20 border rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <button onClick={generateSchedule} className="flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors">
              <RotateCcw className="w-4 h-4" /> Generate Study Plan
            </button>
            <button onClick={generateWithAI} disabled={aiLoading} className="flex items-center gap-2 bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60">
              {aiLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> AI Planning...</> : <><Sparkles className="w-4 h-4" /> Generate with AI</>}
            </button>
          </div>
        </div>
      )}

      {/* Timetable */}
      {schedule.length > 0 && (
        <div className="border rounded-xl p-5 bg-white dark:bg-card shadow-sm">
          <p className="font-semibold mb-1">Daily Study Plan</p>
          <p className="text-sm text-muted-foreground mb-4">Drag sessions between days to rearrange. Click to mark complete.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {timetableDays.map(({ key, label, dayNum, date }) => {
              const dayEntries = schedule.filter((e) => e.date === key);
              const totalHours = dayEntries.reduce((sum, e) => sum + e.hours, 0);
              const isOverloaded = totalHours > hoursPerDay;
              return (
                <div
                  key={key}
                  className={cn("rounded-lg border p-2 min-h-[120px] bg-white dark:bg-card transition-colors", isToday(date) && "border-primary/50 bg-primary/5", dragOverDate === key && "border-primary bg-primary/10", isOverloaded && "border-yellow-400/50")}
                  onDragOver={(e) => { e.preventDefault(); setDragOverDate(key); }}
                  onDragLeave={() => setDragOverDate(null)}
                  onDrop={(e) => { e.preventDefault(); setDragOverDate(null); if (!dragItem) return; const updated = schedule.map((en) => en.id === dragItem ? { ...en, date: key } : en); setSchedule(updated); save(subjects, updated, hoursPerDay); setDragItem(null); }}
                >
                  <div className="text-center mb-2">
                    <p className={cn("text-xs font-medium", isToday(date) ? "text-primary" : "text-muted-foreground")}>{label}</p>
                    <p className="text-sm font-semibold">{dayNum}</p>
                    {totalHours > 0 && <p className={cn("text-[10px]", isOverloaded ? "text-yellow-500" : "text-muted-foreground")}>{totalHours}h/{hoursPerDay}h</p>}
                  </div>
                  <div className="space-y-1.5">
                    {dayEntries.map((entry) => {
                      const colorClass = COLOR_CLASSES[subjects.findIndex((s) => s.id === entry.subjectId) % COLOR_CLASSES.length] || COLOR_CLASSES[0];
                      return (
                        <div
                          key={entry.id}
                          draggable
                          onDragStart={() => setDragItem(entry.id)}
                          onClick={() => toggleCompleted(entry.id)}
                          className={cn("p-1.5 rounded border text-[11px] cursor-grab active:cursor-grabbing transition-all", colorClass, entry.completed && "opacity-50 line-through")}
                        >
                          <div className="flex items-start gap-1">
                            <GripVertical className="w-3 h-3 shrink-0 mt-0.5 opacity-40" />
                            <div className="min-w-0">
                              <p className="font-medium truncate">{entry.subjectName}</p>
                              <p className="truncate opacity-75">{entry.topicName} · {entry.hours}h</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlanner;
