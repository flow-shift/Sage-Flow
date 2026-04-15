import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, RotateCcw, Settings, Coffee, Brain } from "lucide-react";

type Mode = "work" | "shortBreak" | "longBreak";

const Pomodoro = () => {
  const [workMin, setWorkMin] = useState(() => Number(localStorage.getItem("pomo_work") || 25));
  const [shortBreakMin, setShortBreakMin] = useState(() => Number(localStorage.getItem("pomo_short") || 5));
  const [longBreakMin, setLongBreakMin] = useState(() => Number(localStorage.getItem("pomo_long") || 15));
  const [sessionsBeforeLong, setSessionsBeforeLong] = useState(() => Number(localStorage.getItem("pomo_sessions") || 4));
  const [autoStart, setAutoStart] = useState(() => localStorage.getItem("pomo_auto") === "true");
  const [mode, setMode] = useState<Mode>("work");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getDuration = useCallback((m: Mode) => {
    if (m === "work") return workMin * 60;
    if (m === "shortBreak") return shortBreakMin * 60;
    return longBreakMin * 60;
  }, [workMin, shortBreakMin, longBreakMin]);

  useEffect(() => {
    localStorage.setItem("pomo_work", String(workMin));
    localStorage.setItem("pomo_short", String(shortBreakMin));
    localStorage.setItem("pomo_long", String(longBreakMin));
    localStorage.setItem("pomo_sessions", String(sessionsBeforeLong));
    localStorage.setItem("pomo_auto", String(autoStart));
  }, [workMin, shortBreakMin, longBreakMin, sessionsBeforeLong, autoStart]);

  useEffect(() => {
    if (!isRunning) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(intervalRef.current!); handleSessionEnd(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  const handleSessionEnd = () => {
    setIsRunning(false);
    if (mode === "work") {
      const next = completedSessions + 1;
      setCompletedSessions(next);
      const nextMode = next % sessionsBeforeLong === 0 ? "longBreak" : "shortBreak";
      setMode(nextMode);
      setSecondsLeft(getDuration(nextMode));
      if (autoStart) setTimeout(() => setIsRunning(true), 500);
    } else {
      setMode("work");
      setSecondsLeft(getDuration("work"));
      if (autoStart) setTimeout(() => setIsRunning(true), 500);
    }
  };

  const switchMode = (m: Mode) => { setIsRunning(false); setMode(m); setSecondsLeft(getDuration(m)); };
  const reset = () => { setIsRunning(false); setSecondsLeft(getDuration(mode)); };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const total = getDuration(mode);
  const progress = ((total - secondsLeft) / total) * 100;

  const modeConfig = {
    work: { label: "Focus", icon: Brain },
    shortBreak: { label: "Short Break", icon: Coffee },
    longBreak: { label: "Long Break", icon: Coffee },
  };
  const current = modeConfig[mode];

  const sliderRow = (label: string, value: number, onChange: (v: number) => void, min: number, max: number, step: number) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value} min</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-primary" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Pomodoro Timer</h1>
        <p className="text-muted-foreground mt-1">Stay focused with timed work sessions.</p>
      </div>

      <div className="border rounded-xl p-6 bg-card shadow-sm">
        <div className="flex gap-2 justify-center mb-8">
          {(["work", "shortBreak", "longBreak"] as Mode[]).map((m) => (
            <button key={m} onClick={() => switchMode(m)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === m ? "bg-primary text-primary-foreground" : "border hover:bg-muted"}`}>
              {modeConfig[m].label}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="relative w-56 h-56 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 224 224">
              <circle cx="112" cy="112" r="100" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <circle cx="112" cy="112" r="100" fill="none" stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 100}
                strokeDashoffset={2 * Math.PI * 100 * (1 - progress / 100)}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="text-center z-10">
              <current.icon className="w-6 h-6 mx-auto mb-1 text-primary" />
              <span className="text-5xl font-mono font-bold">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
              <p className="text-sm text-muted-foreground mt-1">{current.label}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={reset} className="border rounded-lg p-2.5 hover:bg-muted transition-colors">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button onClick={() => setIsRunning(!isRunning)} className="flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-8 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors">
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isRunning ? "Pause" : "Start"}
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className="border rounded-lg p-2.5 hover:bg-muted transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {Array.from({ length: sessionsBeforeLong }).map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i < completedSessions % sessionsBeforeLong ? "bg-primary" : "bg-muted"}`} />
            ))}
            <span className="text-xs text-muted-foreground ml-2">{completedSessions} sessions done</span>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="border rounded-xl p-5 bg-card shadow-sm space-y-5">
          <p className="font-semibold">Timer Settings</p>
          {sliderRow("Focus Duration", workMin, (v) => { setWorkMin(v); if (mode === "work" && !isRunning) setSecondsLeft(v * 60); }, 5, 60, 5)}
          {sliderRow("Short Break", shortBreakMin, (v) => { setShortBreakMin(v); if (mode === "shortBreak" && !isRunning) setSecondsLeft(v * 60); }, 1, 15, 1)}
          {sliderRow("Long Break", longBreakMin, (v) => { setLongBreakMin(v); if (mode === "longBreak" && !isRunning) setSecondsLeft(v * 60); }, 5, 30, 5)}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Sessions before long break</span>
              <span className="text-muted-foreground">{sessionsBeforeLong}</span>
            </div>
            <input type="range" min={2} max={8} step={1} value={sessionsBeforeLong} onChange={(e) => setSessionsBeforeLong(Number(e.target.value))} className="w-full accent-primary" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Auto-start next session</span>
            <button onClick={() => setAutoStart(!autoStart)} className={`relative w-11 h-6 rounded-full transition-colors ${autoStart ? "bg-primary" : "bg-muted-foreground/30"}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${autoStart ? "translate-x-5" : ""}`} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pomodoro;
