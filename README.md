# UzAstro — Koinotni kashf et. Kelajakni yarat.

Next.js 15 + TypeScript + Tailwind + Framer Motion + React Three Fiber + Supabase.
Interfeys to'liq o'zbek tilida (lotin yozuvi).

> **Holat:** kod yozilgan, lekin `npm install` / `build` / `typecheck` ishga tushirilmagan
> (yaratish muhitida npm reestriga kirish bloklangan edi). Ishga tushirgach xatolar chiqsa, ularni tuzatish kerak bo'ladi.

## Ishga tushirish

1. `npm install`
2. Supabase loyihasi yarating → SQL Editor'da ketma-ket bajaring:
   - `supabase/migrations/001_schema.sql`
   - `supabase/seed.sql`
3. `.env.example` → `.env.local` nusxasini oling va to'ldiring:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — **majburiy**
   - `ANTHROPIC_API_KEY` — **AI Yordamchi uchun majburiy** (kalitsiz AI 503 xabarini qaytaradi, javoblar to'qilmaydi)
   - `NASA_API_KEY` — ixtiyoriy (`DEMO_KEY` cheklangan)
4. Supabase → Authentication → URL Configuration: Site URL sifatida saytingiz manzilini kiriting.
   Tezkor sinov uchun Authentication → Providers → Email'da "Confirm email"ni o'chirib qo'yishingiz mumkin.
5. `npm run dev`

## Arxitektura

- `supabase/migrations/001_schema.sql` — jadvallar, RLS, server mantiqi.
  **XP, daraja, seriya, yutuqlar faqat `SECURITY DEFINER` funksiyalar orqali beriladi**;
  mijoz `profiles.xp` va boshqalarni o'zgartira olmaydi (column-level grant).
  Viktorina to'g'ri javoblari (`quiz_questions.correct`) mijozga hech qachon yuborilmaydi — ball serverda hisoblanadi.
- Kunlik vazifalar Toshkent sanasi bo'yicha almashadi; seriya foydalanuvchining `timezone` maydoni bo'yicha hisoblanadi.
- `src/app/api/ai/route.ts` — AI backend (Anthropic Messages API), suhbatlar RLS bilan saqlanadi, kuniga 100 xabar limiti.
- `src/app/api/apod/route.ts` — NASA APOD.

## Ma'lum cheklovlar (halol ro'yxat)

- Tashqi (push/email) bildirishnomalar yo'q — bildirishnomalar ilova ichida (qo'ng'iroq belgisi).
  "Yangi vazifalar" bildirishnomasi foydalanuvchi vazifalar ro'yxatini birinchi marta ochganda yaratiladi.
- Viktorina savollari: har bir mavzuda 4 tadan (jami 32). Ko'proq savol qo'shish uchun `quiz_questions` jadvaliga yozing.
- Kashfiyotlar sahifasida rasmlar o'rniga CSS/emoji "sayyoralar" ishlatilgan; haqiqiy fotosurat faqat NASA APOD orqali keladi.
- Kosmik voqealar (`space_events`) qo'lda kiritilgan; sanalar taxminiy — nashr oldidan tekshiring.
- Jamoa vazifalari — haftalik XP maqsadlari (progress ko'rsatiladi), alohida mukofot berilmaydi.
- Faqat bitta jamoada bo'lish mumkin; jamoadan a'zoni chiqarish (kick) hali yo'q.
- Testlar yo'q (unit/e2e).
