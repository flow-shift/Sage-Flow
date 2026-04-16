import { useState } from "react";
import { FileText, Play, RotateCcw, CheckCircle2, XCircle } from "lucide-react";

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

const stopWords = new Set([
  "the","a","an","is","are","was","were","be","been","being","have","has","had","do","does","did",
  "will","would","could","should","may","might","shall","can","to","of","in","for","on","with","at",
  "by","from","as","into","through","before","after","out","over","under","then","once","here","there",
  "when","where","why","how","all","each","every","both","few","more","most","other","some","such","no",
  "not","only","same","so","than","too","very","just","because","but","and","or","if","while","that",
  "this","it","its","they","them","their","we","us","our","you","your","he","him","his","she","her",
  "i","me","my","which","what","who","whom","also","about","after","again","any","been","between",
]);

function generateQuestions(text: string, count: number): Question[] {
  // Split into sentences — relaxed filter (min 6 words)
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length >= 6 && s.length > 20);

  if (!sentences.length) return [];

  const questions: Question[] = [];
  const used = new Set<string>();

  // Get all meaningful words from full text for distractors
  const allWords = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !stopWords.has(w));
  const uniqueWords = [...new Set(allWords)];

  const shuffled = [...sentences].sort(() => Math.random() - 0.5);

  for (const s of shuffled) {
    if (questions.length >= count) break;

    const words = s.split(/\s+/);

    // Find candidate keywords — meaningful words not at start/end
    const candidates = words.filter((w, idx) => {
      const clean = w.replace(/[^a-zA-Z]/g, "").toLowerCase();
      return (
        clean.length >= 4 &&
        idx > 0 &&
        idx < words.length - 1 &&
        !stopWords.has(clean) &&
        !used.has(clean)
      );
    });

    if (!candidates.length) continue;

    const keyword = candidates[Math.floor(Math.random() * candidates.length)];
    const cleanKeyword = keyword.replace(/[^a-zA-Z]/g, "").toLowerCase();
    if (!cleanKeyword || used.has(cleanKeyword)) continue;
    used.add(cleanKeyword);

    const keywordIndex = words.findIndex((w) =>
      w.replace(/[^a-zA-Z]/g, "").toLowerCase() === cleanKeyword
    );
    if (keywordIndex === -1) continue;

    const question =
      words.slice(0, keywordIndex).join(" ") +
      " ______ " +
      words.slice(keywordIndex + 1).join(" ");

    // Build distractors — words of similar length
    const distractors = uniqueWords
      .filter(
        (w) =>
          w !== cleanKeyword &&
          Math.abs(w.length - cleanKeyword.length) <= 4 &&
          !stopWords.has(w)
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    if (distractors.length < 3) continue;

    const options = [...distractors, cleanKeyword].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(cleanKeyword);

    questions.push({ id: questions.length, question, options, correctIndex });
  }

  return questions;
}

const TestGenerator = () => {
  const [paragraph, setParagraph] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [error, setError] = useState("");

  const handleGenerate = () => {
    if (!paragraph.trim()) return;
    setError("");
    const qs = generateQuestions(paragraph, numQuestions);
    if (qs.length === 0) {
      setError("Could not generate questions. Please paste a longer paragraph with more descriptive sentences.");
      return;
    }
    setQuestions(qs);
    setResults([]);
    setSubmitted(false);
    setSelected({});
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
        <p className="text-muted-foreground mt-1">Paste a paragraph to auto-generate fill-in-the-blank questions.</p>
      </div>

      {questions.length === 0 ? (
        <div className="border rounded-xl p-5 bg-white dark:bg-card shadow-sm space-y-4">
          <p className="font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Input Paragraph
          </p>
          <textarea
            placeholder="Paste your study material here... (paste at least 3-4 sentences for best results)"
            value={paragraph}
            onChange={(e) => { setParagraph(e.target.value); setError(""); }}
            rows={7}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
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
              disabled={!paragraph.trim()}
              className="flex items-center gap-1 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              <Play className="w-4 h-4" /> Generate
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
