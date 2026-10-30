"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { errText, getSupabase } from "@/lib/supabase";
import type { QuizQuestion, QuizResult } from "@/lib/types";
import { useApp } from "./AppProvider";
import { Modal, Spinner } from "./ui";

interface Props {
  open: boolean;
  title: string;
  topic: string;
  count: number;
  /** Vazifa viktorinasi bo'lsa — quest id; aks holda mavzu mashqi */
  questId?: number;
  onClose: () => void;
  onFinished?: (r: QuizResult) => void;
}

export default function Quiz({ open, title, topic, count, questId, onClose, onFinished }: Props) {
  const { toast, refreshProfile } = useApp();
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setQuestions(null);
    setStep(0);
    setAnswers({});
    setResult(null);
    getSupabase()
      .rpc("get_quiz", { p_topic: topic, p_count: count })
      .then(({ data, error }) => {
        if (error) {
          toast(errText(error), "err");
          onClose();
        } else setQuestions((data as QuizQuestion[]) ?? []);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, topic, count]);

  const submit = async () => {
    if (!questions) return;
    setBusy(true);
    const payload = questions.map((q) => ({ id: q.id, choice: answers[q.id] ?? -1 }));
    const sb = getSupabase();
    const { data, error } = questId
      ? await sb.rpc("submit_quest_quiz", { p_quest: questId, p_answers: payload })
      : await sb.rpc("submit_topic_quiz", { p_topic: topic, p_answers: payload });
    setBusy(false);
    if (error) return toast(errText(error), "err");
    const r = data as QuizResult;
    setResult(r);
    if (r.xp > 0) toast(`+${r.xp} XP qo‘lga kiritildi!`, "xp");
    await refreshProfile();
    onFinished?.(r);
  };

  const q = questions?.[step];
  const isLast = questions ? step === questions.length - 1 : false;

  return (
    <Modal open={open} onClose={onClose} title={title}>
      {!questions && <Spinner />}
      {questions && questions.length === 0 && <p className="text-sm text-snow/60">Bu mavzu uchun savollar topilmadi.</p>}

      {questions && !result && q && (
        <div>
          <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="xp-bar h-full rounded-full transition-all" style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
          </div>
          <p className="mb-1 text-xs text-snow/50">
            Savol {step + 1} / {questions.length}
          </p>
          <h3 className="mb-4 font-display text-lg font-semibold">{q.question}</h3>
          <div className="space-y-2">
            {q.options.map((o, i) => {
              const sel = answers[q.id] === i;
              return (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  key={i}
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                  className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    sel ? "border-neon bg-neon/15 shadow-neon" : "border-white/10 bg-white/5 hover:border-neon/40"
                  }`}
                >
                  <span className="mr-2 text-snow/40">{String.fromCharCode(65 + i)}.</span>
                  {o}
                </motion.button>
              );
            })}
          </div>
          <div className="mt-5 flex justify-between gap-2">
            <button className="btn-ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              Orqaga
            </button>
            {isLast ? (
              <button className="btn-primary" disabled={busy || Object.keys(answers).length < questions.length} onClick={submit}>
                {busy ? "Tekshirilmoqda..." : "Yakunlash"}
              </button>
            ) : (
              <button className="btn-primary" disabled={answers[q.id] === undefined} onClick={() => setStep((s) => s + 1)}>
                Keyingisi
              </button>
            )}
          </div>
        </div>
      )}

      {questions && result && (
        <div>
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <div className="text-4xl">{result.passed === false ? "🛰️" : "🎉"}</div>
            <div className="mt-1 font-display text-2xl font-bold">
              {result.score} / {result.total}
            </div>
            <p className="text-sm text-snow/65">
              {questId
                ? result.passed
                  ? `Vazifa bajarildi! +${result.xp} XP`
                  : "Yetarli emas. Qayta urinib ko‘ring!"
                : result.rewarded
                  ? `Bugungi mukofot: +${result.xp} XP`
                  : "Bu mavzu uchun bugungi mukofot allaqachon olingan. Mashq qilishda davom eting!"}
            </p>
          </div>
          <div className="space-y-3">
            {questions.map((qq) => {
              const rv = result.review.find((r) => r.id === qq.id);
              if (!rv) return null;
              return (
                <div key={qq.id} className={`rounded-2xl border p-3 text-sm ${rv.ok ? "border-emerald-400/30 bg-emerald-400/5" : "border-rose-400/30 bg-rose-400/5"}`}>
                  <div className="font-semibold">
                    {rv.ok ? "✅" : "❌"} {qq.question}
                  </div>
                  <div className="mt-1 text-xs text-snow/70">To‘g‘ri javob: {qq.options[rv.correct]}</div>
                  <div className="mt-1 text-xs text-snow/55">{rv.explanation}</div>
                </div>
              );
            })}
          </div>
          <button className="btn-primary mt-5 w-full" onClick={onClose}>
            Yopish
          </button>
        </div>
      )}
    </Modal>
  );
}
