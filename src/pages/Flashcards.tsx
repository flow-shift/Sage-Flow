import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, RotateCcw, ChevronLeft, ChevronRight, Layers, Shuffle } from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  deck: string;
}

const Flashcards = () => {
  const { toast } = useToast();
  const [cards, setCards] = useState<Flashcard[]>(() => JSON.parse(localStorage.getItem("flashcards") || "[]"));
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [deck, setDeck] = useState("General");
  const [newDeck, setNewDeck] = useState("");
  const [reviewDeck, setReviewDeck] = useState<string | null>(null);
  const [reviewCards, setReviewCards] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const decks = [...new Set(cards.map((c) => c.deck))];

  useEffect(() => { localStorage.setItem("flashcards", JSON.stringify(cards)); }, [cards]);

  const addCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    const activeDeck = newDeck.trim() || deck;
    setCards([...cards, { id: Date.now().toString(), front: front.trim(), back: back.trim(), deck: activeDeck }]);
    setFront(""); setBack(""); setNewDeck("");
    if (!decks.includes(activeDeck)) setDeck(activeDeck);
    toast({ title: "Card added", description: `Added to "${activeDeck}"` });
  };

  const startReview = (deckName: string, shuffle = false) => {
    const deckCards = cards.filter((c) => c.deck === deckName);
    if (!deckCards.length) return;
    setReviewCards(shuffle ? [...deckCards].sort(() => Math.random() - 0.5) : deckCards);
    setReviewDeck(deckName);
    setCurrentIdx(0);
    setFlipped(false);
  };

  const exitReview = () => { setReviewDeck(null); setReviewCards([]); setCurrentIdx(0); setFlipped(false); };

  if (reviewDeck && reviewCards.length > 0) {
    const card = reviewCards[currentIdx];
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Reviewing: {reviewDeck}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Card {currentIdx + 1} of {reviewCards.length}</p>
          </div>
          <button onClick={exitReview} className="border rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
            Exit Review
          </button>
        </div>

        <div className="border rounded-xl p-8 bg-card min-h-[280px] flex items-center justify-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFlipped(!flipped)}>
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">{flipped ? "Answer" : "Question"} — tap to flip</p>
            <p className="text-2xl font-semibold">{flipped ? card.back : card.front}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button disabled={currentIdx === 0} onClick={() => { setCurrentIdx(currentIdx - 1); setFlipped(false); }} className="border rounded-lg p-2 hover:bg-muted transition-colors disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setFlipped(!flipped)} className="border rounded-lg p-2 hover:bg-muted transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button disabled={currentIdx === reviewCards.length - 1} onClick={() => { setCurrentIdx(currentIdx + 1); setFlipped(false); }} className="border rounded-lg p-2 hover:bg-muted transition-colors disabled:opacity-40">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Flashcards</h1>
        <p className="text-muted-foreground mt-1">Create and review flashcards for your subjects.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="border rounded-xl p-5 bg-card shadow-sm">
          <p className="font-semibold mb-4">Create Card</p>
          <form onSubmit={addCard} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Deck</label>
              {decks.length > 0 && (
                <select value={deck} onChange={(e) => setDeck(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50">
                  {decks.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              )}
              <input placeholder="Or type a new deck name..." value={newDeck} onChange={(e) => setNewDeck(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Question</label>
              <textarea placeholder="Enter your question" value={front} onChange={(e) => setFront(e.target.value)} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Answer</label>
              <textarea placeholder="Enter the answer" value={back} onChange={(e) => setBack(e.target.value)} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> Add Card
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <p className="font-semibold text-lg">Your Decks</p>
          {decks.length === 0 ? (
            <div className="border rounded-xl p-8 bg-card text-center text-muted-foreground">
              <Layers className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No flashcards yet. Create your first card!</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {decks.map((d) => {
                const deckCards = cards.filter((c) => c.deck === d);
                return (
                  <div key={d} className="border rounded-xl p-4 bg-card shadow-sm space-y-3">
                    <div>
                      <p className="font-semibold">{d}</p>
                      <p className="text-sm text-muted-foreground">{deckCards.length} card{deckCards.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {deckCards.map((c) => (
                        <div key={c.id} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                          <span className="truncate flex-1">{c.front}</span>
                          <button onClick={() => setCards(cards.filter((x) => x.id !== c.id))} className="text-muted-foreground hover:text-destructive ml-2">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startReview(d)} className="flex-1 bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-primary/90 transition-colors">
                        Review
                      </button>
                      <button onClick={() => startReview(d, true)} className="border rounded-lg px-3 py-1.5 text-sm hover:bg-muted transition-colors">
                        <Shuffle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Flashcards;
