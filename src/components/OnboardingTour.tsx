import { useState, useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

const steps = [
  { title: "Welcome to Sage Flow! 🎉", description: "Let's take a quick tour to help you get started with managing your studies effectively." },
  { title: "Dashboard Overview 📊", description: "Your dashboard shows a summary of tasks, study hours, and upcoming exams. Check here daily to stay on track." },
  { title: "Task Management ✅", description: "Create tasks with priority levels (Low, Medium, High). Mark them complete when done." },
  { title: "Study Planner 📅", description: "Add subjects and exam dates. Break subjects into topics. Click 'Generate Schedule' to auto-create your study plan. Drag and drop to reschedule!" },
  { title: "Test Generator 📝", description: "Paste your study material and generate practice tests. Get instant feedback and track your progress." },
  { title: "Pomodoro Timer ⏱️", description: "Stay focused with timed work sessions. Customize work and break intervals." },
  { title: "Flashcards 🎴", description: "Create decks for different subjects. Click to flip cards while studying. Shuffle for varied practice." },
  { title: "Analytics 📈", description: "View your study statistics, task completion rates, and test score trends." },
  { title: "You're All Set! 🚀", description: "Start by adding your first task or creating a study plan. Consistency is key!" },
];

export const OnboardingTour = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem("hasSeenOnboarding")) setOpen(true);
  }, []);

  const complete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border rounded-xl shadow-xl w-full max-w-lg p-6 space-y-5">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-bold">{steps[step].title}</h2>
          <button onClick={complete} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-muted-foreground leading-relaxed">{steps[step].description}</p>

        <div className="flex gap-2 justify-center">
          {steps.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${i === step ? "bg-primary w-8" : "bg-muted w-2"}`} />
          ))}
        </div>

        <div className="flex justify-between">
          <button onClick={complete} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Skip Tour
          </button>
          <button
            onClick={() => step < steps.length - 1 ? setStep(step + 1) : complete()}
            className="flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-5 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {step === steps.length - 1 ? <><CheckCircle2 className="w-4 h-4" /> Get Started</> : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};
