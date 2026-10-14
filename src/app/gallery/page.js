import fs from "fs";
import path from "path";
import Reveal from "@/components/Reveal";
import Image from "next/image";

export const metadata = {
  title: "Gallery",
  description:
    "A collection of moments, screenings, workshops and achievements from Oxsnow Studio.",
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
          Moments from the field
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-steel">
          Screenings, workshops, achievements and behind-the-scenes from
          Oxsnow Studio across Lesotho.
        </p>
      </Reveal>

      <div className="mt-14 columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
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
    </section>
  );
}
