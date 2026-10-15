import fs from "fs";
import path from "path";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { posters } from "@/lib/site";

export const metadata = {
  title: "Gallery",
  description:
    "Film covers, screenings, workshops and achievements from Oxsnow Studio.",
};

function getImages() {
  const dir = path.join(process.cwd(), "public", "gallery");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
    .sort();
}

export default function GalleryPage() {
  const images = getImages();

  return (
    <section className="mx-auto w-full max-w-7xl px-5 pb-24 pt-36 sm:px-8">
      <Reveal>
        <p className="eyebrow flex items-center gap-3">
          <span className="rule-fire" />
          Gallery
        </p>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-metal sm:text-6xl">
          Covers & moments
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-steel">
          Film covers from our slate, plus screenings, workshops, achievements
          and behind-the-scenes from Oxsnow Studio across Lesotho.
        </p>
      </Reveal>

      {posters.length > 0 && (
        <div className="mt-16">
          <Reveal>
            <h2 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-metal">
              <span className="rule-fire" />
              Film Covers
            </h2>
          </Reveal>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posters.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <Link
                  href={p.href}
                  className="group block overflow-hidden rounded-xl border border-white/10 bg-ink-2 shadow-[0_40px_80px_-60px_rgba(255,69,0,0.6)]"
                >
                  <div className="relative aspect-[2/3]">
                    <Image
                      src={p.src}
                      alt={p.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 pt-14">
                      <p className="text-xl font-bold text-white transition-colors group-hover:text-ember">
                        {p.title}
                      </p>
                      <p className="mt-1 text-[0.65rem] uppercase tracking-[0.22em] text-ember">
                        {p.year}
                      </p>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      <div className="mt-20">
        <Reveal>
          <h2 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-metal">
            <span className="rule-fire" />
            Moments from the field
          </h2>
        </Reveal>
        <div className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
          {images.map((src) => (
            <Reveal key={src} className="mb-4 break-inside-avoid">
              <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-ink-2 shadow-[0_40px_80px_-60px_rgba(255,69,0,0.5)]">
                <Image
                  src={`/gallery/${src}`}
                  alt={src.replace(/\.[^/.]+$/, "")}
                  width={1200}
                  height={1600}
                  className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
