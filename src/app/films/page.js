import FilmsGrid from "@/components/FilmsGrid";
import Reveal from "@/components/Reveal";
import { films } from "@/lib/site";

export const metadata = {
  title: "Films & Projects",
  description:
    "Feature films, archival documentaries, educational series and behind-the-scenes projects from Oxsnow Studio.",
};

export default function FilmsPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 pb-24 pt-36 sm:px-8">
      <Reveal>
        <p className="eyebrow flex items-center gap-3">
          <span className="rule-fire" />
          Product Showcase
        </p>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-metal sm:text-6xl">
          Films & Projects
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-steel">
          Current and upcoming feature films, documentaries and archival works —
          each one rooted in authentic Basotho heritage and shot for the world.
        </p>
      </Reveal>

      <div className="mt-14">
        <FilmsGrid films={films} />
      </div>
    </section>
  );
}
