"use client";

import { useEffect, useState } from "react";
import { Spinner } from "./ui";

interface Apod {
  title: string;
  explanation: string;
  url: string;
  media_type: string;
  date: string;
  copyright?: string;
  error?: string;
}

export default function ApodCard() {
  const [data, setData] = useState<Apod | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/apod")
      .then((r) => r.json())
      .then((d: Apod) => (d.error ? setFailed(true) : setData(d)))
      .catch(() => setFailed(true));
  }, []);

  return (
    <section className="glass overflow-hidden">
      <div className="p-5 pb-3">
        <h2 className="font-display text-xl font-bold">Kunning astronomik surati</h2>
        <p className="text-xs text-snow/50">NASA Astronomy Picture of the Day</p>
      </div>
      {!data && !failed && <Spinner />}
      {failed && <p className="p-5 pt-0 text-sm text-snow/55">Hozircha NASA surati yuklanmadi. Birozdan so‘ng qayta urinib ko‘ring.</p>}
      {data && (
        <div>
          {data.media_type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.url} alt={data.title} className="max-h-72 w-full object-cover" loading="lazy" />
          ) : (
            <a href={data.url} target="_blank" rel="noreferrer" className="block px-5 py-8 text-center text-neon underline">
              Videoni NASA saytida ko‘rish
            </a>
          )}
          <div className="p-5">
            <h3 className="font-semibold">{data.title}</h3>
            <p className="text-xs text-snow/45">
              {data.date}
              {data.copyright ? ` · © ${data.copyright.trim()}` : ""}
            </p>
            <p className="mt-2 text-xs text-snow/45">Izoh NASA tomonidan ingliz tilida berilgan; AI Yordamchidan o‘zbekcha tushuntirib berishni so‘rashingiz mumkin.</p>
          </div>
        </div>
      )}
    </section>
  );
}
