import { useState, useEffect } from "react";
import { gemini } from "@/lib/firebase";
import { Sparkles, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";

interface AptitudeQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const TODAY = format(new Date(), "yyyy-MM-dd");
const STORAGE_KEY = `aptitude_${TODAY}`;
const ANSWERED_KEY = `aptitude_answered_${TODAY}`;

export const DailyAptitude = () => {
  const [question, setQuestion] = useState<AptitudeQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    // Already answered today
    if (localStorage.getItem(ANSWERED_KEY)) {
      setAnswered(true);
      setLoading(false);
      return;
    }

    // Use cached question for today
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      setQuestion(JSON.parse(cached));
      setLoading(false);
      return;
    }

    // Generate new question via Gemini
    generateQuestion();
  }, []);

  const generateQuestion = async () => {
    setLoading(true);
    try {
      const topics = [
        "number series", "percentage", "profit and loss", "time and work",
        "speed distance time", "ratio and proportion", "probability",
        "logical reasoning", "data interpretation", "coding decoding",
        "blood relations", "direction sense", "analogies", "syllogisms"
      ];
      const topic = topics[new Date().getDate() % topics.length];

      const prompt = `Generate one aptitude question on the topic: "${topic}".
The question should be suitable for competitive exams.

Return ONLY valid JSON, no extra text:
{
  "question": "question text here",
  "options": ["option A", "option B", "option C", "option D"],
  "correctIndex": 0,
  "explanation": "brief explanation of the answer"
}`;

      const result = await gemini.generateContent(prompt);
      const text = result.response.text().trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid response");

      const q: AptitudeQuestion = JSON.parse(jsonMatch[0]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(q));
      setQuestion(q);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);

    // Save to aptitude scores
    const scores = JSON.parse(localStorage.getItem("aptitudeScores") || "[]");
    scores.push({
      date: TODAY,
      correct: selected === question?.correctIndex,
      topic: question?.question.slice(0, 30),
    });
    localStorage.setItem("aptitudeScores", JSON.stringify(scores));
    localStorage.setItem(ANSWERED_KEY, "true");

    // Hide after 3 seconds
    setTimeout(() => setAnswered(true), 3000);
  };

  if (answered || loading && !question) return null;

  if (loading) return (
    <div className="border rounded-xl p-5 bg-white shadow-sm flex items-center gap-3">
      <Loader2 className="w-5 h-5 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading today's aptitude question...</p>
    </div>
  );

  if (!question) return null;

  const isCorrect = selected === question.correctIndex;

  return (
    <div className="border-2 border-primary/20 rounded-xl p-5 bg-white shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm">Daily Aptitude Challenge</p>
          <p className="text-xs text-muted-foreground">{format(new Date(), "EEEE, MMMM d")}</p>
        </div>
        {submitted && (
          <span className={`ml-auto text-xs font-semibold px-2 py-1 rounded-full ${isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
            {isCorrect ? "Correct! ✓" : "Wrong ✗"}
          </span>
        )}
      </div>

      <p className="font-medium text-sm leading-relaxed">{question.question}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {question.options.map((opt, i) => {
          let cls = "border rounded-lg px-3 py-2 text-sm text-left transition-colors flex items-center gap-2 ";
          if (submitted) {
            if (i === question.correctIndex) cls += "bg-green-50 border-green-400 text-green-800";
            else if (i === selected) cls += "bg-red-50 border-red-400 text-red-700";
            else cls += "border-border text-muted-foreground opacity-60";
          } else {
            cls += selected === i ? "bg-primary/10 border-primary font-medium" : "border-border hover:bg-gray-50 cursor-pointer";
          }
          return (
            <button key={i} className={cls} onClick={() => !submitted && setSelected(i)}>
              {submitted && i === question.correctIndex && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
              {submitted && i === selected && i !== question.correctIndex && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
              <span className="font-medium mr-1">{String.fromCharCode(65 + i)}.</span> {opt}
            </button>
          );
        })}
      </div>

      {submitted && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
          <span className="font-semibold">Explanation: </span>{question.explanation}
        </div>
      )}

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={selected === null}
          className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          Submit Answer
        </button>
      )}
    </div>
  );
};
