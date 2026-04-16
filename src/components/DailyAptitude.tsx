import { useState, useEffect } from "react";
import { gemini } from "@/lib/firebase";
import { Sparkles, Loader2, CheckCircle2, XCircle, X } from "lucide-react";
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
  const [popupOpen, setPopupOpen] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(ANSWERED_KEY)) {
      setAnswered(true);
      setLoading(false);
      return;
    }

    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      setQuestion(JSON.parse(cached));
      setLoading(false);
      setPopupOpen(true);
      return;
    }

    generateQuestion();
  }, []);

  const generateQuestion = async () => {
    setLoading(true);
    try {
      const topics = [
        "number series", "percentage", "profit and loss", "time and work",
        "speed distance time", "ratio and proportion", "probability",
        "logical reasoning", "data interpretation", "coding decoding",
        "blood relations", "direction sense", "analogies", "syllogisms",
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
      setPopupOpen(true);
    } catch (e: any) {
      console.error("Gemini error:", e?.message, e?.code, e);
      setError(true);
      setPopupOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);

    const scores = JSON.parse(localStorage.getItem("aptitudeScores") || "[]");
    scores.push({
      date: TODAY,
      correct: selected === question?.correctIndex,
      topic: question?.question.slice(0, 40),
    });
    localStorage.setItem("aptitudeScores", JSON.stringify(scores));
    localStorage.setItem(ANSWERED_KEY, "true");

    setTimeout(() => {
      setPopupOpen(false);
      setAnswered(true);
    }, 3000);
  };

  // Already answered — show nothing
  if (answered) return null;

  // Still loading and no question yet — show nothing
  if (loading && !question) return null;

  const isCorrect = submitted && selected === question?.correctIndex;

  return (
    <>
      {/* Persistent top banner — shown when popup is closed but not answered */}
      {!popupOpen && !answered && (
        <div
          className="fixed top-14 md:top-0 left-0 md:left-64 right-0 z-40 flex items-center px-4 py-2.5 text-white text-sm font-semibold"
          style={{ background: "linear-gradient(90deg, #10b981, #059669)" }}
        >
          <button
            onClick={() => setPopupOpen(true)}
            className="flex items-center gap-2 flex-1 text-left"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>📝 Daily Aptitude — Tap to answer today's challenge!</span>
          </button>
        </div>
      )}

      {/* Popup */}
      {popupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-base">Daily Aptitude Challenge</p>
                  <p className="text-emerald-100 text-xs">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
                </div>
              </div>
              {!submitted && (
                <button
                  onClick={() => setPopupOpen(false)}
                  className="text-white/70 hover:text-white transition-colors"
                  title="Close — banner will remind you"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                  <p className="text-sm text-gray-500">Generating today's question with AI...</p>
                </div>
              ) : error ? (
                <div className="text-center py-6 space-y-4">
                  <p className="text-gray-700 font-semibold">Couldn't load today's question</p>
                  <p className="text-sm text-gray-400">Please check your internet connection and try again.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setError(false); generateQuestion(); }}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => { setError(false); setPopupOpen(false); }}
                      className="flex-1 border-2 border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {submitted && (
                    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold ${isCorrect ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                      {isCorrect
                        ? <><CheckCircle2 className="w-4 h-4" /> Correct! Well done!</>
                        : <><XCircle className="w-4 h-4" /> Wrong answer</>}
                    </div>
                  )}

                  <p className="font-semibold text-gray-800 leading-relaxed">{question.question}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {question.options.map((opt, i) => {
                      let cls = "border-2 rounded-xl px-4 py-3 text-sm text-left transition-all flex items-center gap-2.5 ";
                      if (submitted) {
                        if (i === question.correctIndex) cls += "bg-green-50 border-green-400 text-green-800 font-medium";
                        else if (i === selected) cls += "bg-red-50 border-red-400 text-red-700";
                        else cls += "border-gray-100 text-gray-400";
                      } else {
                        cls += selected === i
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-medium"
                          : "border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50/50 cursor-pointer";
                      }
                      return (
                        <button key={i} className={cls} onClick={() => !submitted && setSelected(i)}>
                          <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold shrink-0">
                            {String.fromCharCode(65 + i)}
                          </span>
                          {opt}
                          {submitted && i === question.correctIndex && <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto shrink-0" />}
                          {submitted && i === selected && i !== question.correctIndex && <XCircle className="w-4 h-4 text-red-500 ml-auto shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {submitted && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
                      <span className="font-semibold">💡 Explanation: </span>{question.explanation}
                    </div>
                  )}

                  {!submitted && (
                    <button
                      onClick={handleSubmit}
                      disabled={selected === null}
                      className="w-full text-white rounded-xl py-3 text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                    >
                      Submit Answer
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
