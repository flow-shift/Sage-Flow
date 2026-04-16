import { useState } from "react";
import { FileText, Play, RotateCcw, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { gemini } from "@/lib/firebase";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

interface TestResult {
  questionId: number;
  selectedIndex: number | null;
  correct: boolean;
}

const TestGenerator = () => {
  const [paragraph, setParagraph] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!paragraph.trim()) return;
    setLoading(true);
    setError("");

    try {
      const prompt = `You are a quiz generator. Based on the following text, generate exactly ${numQuestions} multiple choice questions.

Text:
"""
${paragraph}
"""

Rules:
- Each question must be based strictly on the text above
- Each question must have exactly 4 options (A, B, C, D)
- Only one option is correct
- Make wrong options plausible but clearly incorrect
- Return ONLY a valid JSON array, no extra text, no markdown

Format:
[
  {
    "question": "question text here",
    "options": ["option A", "option B", "option C", "option D"],
    "correctIndex": 0
  }
]`;

      const result = await gemini.generateContent(prompt);
      const text = result.response.text().trim();

      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Invalid response format");

      const parsed = JSON.parse(jsonMatch[0]);
      const qs: Question[] = parsed.map((q: any, i: number) => ({
        id: i,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
      }));

      setQuestions(qs);
      setResults([]);
      setSubmitted(false);
      setSelected({});
    } catch (e: any) {
      setError("Couldn't generate questions. Please check your internet connection and try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    const res = questions.map((q) => ({
      questionId: q.id,
      selectedIndex: selected[q.id] ?? null,
      correct: selected[q.id] === q.correctIndex,
    }));
    setResults(res);
    setSubmitted(true);
    const scores = JSON.parse(localStorage.getItem("testScores") || "[]");
    scores.push({ date: new Date().toISOString(), score: res.filter((r) => r.correct).length, total: questions.length });
    localStorage.setItem("testScores", JSON.stringify(scores));
  };

  const reset = () => { setQuestions([]); setResults([]); setSubmitted(false); setSelected({}); setError(""); };
  const score = results.filter((r) => r.correct).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">MCQ Test Generator</h1>
        <p className="text-muted-foreground mt-1">Paste your study material and AI will generate questions for you.</p>
      </div>

      {questions.length === 0 ? (
        <div className="border rounded-xl p-5 bg-white dark:bg-card shadow-sm space-y-4">
          <p className="font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Input Paragraph
          </p>
          <textarea
            placeholder="Paste your study material here..."
            value={paragraph}
            onChange={(e) => { setParagraph(e.target.value); setError(""); }}
            rows={7}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
          {error && (
            <div className="border border-red-200 bg-red-50 rounded-xl p-4 text-center space-y-3">
              <p className="text-2xl">😕</p>
              <p className="text-sm font-semibold text-red-700">Couldn't generate questions</p>
              <p className="text-xs text-red-500">Please check your internet connection and try again.</p>
              <button onClick={() => setError("")} className="text-xs text-red-600 underline">Dismiss</button>
            </div>
          )}
          <div className="flex items-end gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Number of questions</label>
              <input
                type="number" min={1} max={20} value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-24 border rounded-lg px-3 py-2 text-sm bg-white dark:bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={!paragraph.trim() || loading}
              className="flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Play className="w-4 h-4" /> Generate with AI</>}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {submitted && (
            <div className="border border-primary/30 bg-white dark:bg-card rounded-xl px-5 py-4 flex items-center justify-between shadow-sm">
              <p className="text-lg font-semibold">
                Score: {score}/{questions.length} ({Math.round((score / questions.length) * 100)}%)
              </p>
              <button onClick={reset} className="flex items-center gap-1 border rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
                <RotateCcw className="w-4 h-4" /> New Test
              </button>
            </div>
          )}

          {questions.map((q, qi) => {
            const result = results.find((r) => r.questionId === q.id);
            return (
              <div key={q.id} className={`border rounded-xl p-5 bg-white dark:bg-card shadow-sm space-y-3 ${submitted ? (result?.correct ? "border-green-500/40" : "border-destructive/40") : ""}`}>
                <p className="font-medium">
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full mr-2 font-semibold">Q{qi + 1}</span>
                  {q.question}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, oi) => {
                    const isSelected = selected[q.id] === oi;
                    const isCorrect = q.correctIndex === oi;
                    let cls = "border rounded-lg px-4 py-2.5 text-sm text-left w-full transition-colors flex items-center gap-2 ";
                    if (submitted) {
                      if (isCorrect) cls += "bg-green-500/10 border-green-500/50";
                      else if (isSelected) cls += "bg-destructive/10 border-destructive/50";
                      else cls += "border-border text-muted-foreground";
                    } else {
                      cls += isSelected ? "bg-primary/10 border-primary" : "border-border hover:bg-muted cursor-pointer";
                    }
                    return (
                      <button key={oi} className={cls} onClick={() => !submitted && setSelected((p) => ({ ...p, [q.id]: oi }))}>
                        {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                        {submitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-destructive shrink-0" />}
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {!submitted && (
            <button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-3 text-sm font-medium hover:bg-primary/90 transition-colors">
              Submit Answers
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TestGenerator;
