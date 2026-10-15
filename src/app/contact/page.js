import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";
import { site } from "@/lib/site";

export const metadata = {
  title: "Contact & Partners",
  description:
    "Partner with Oxsnow Studio — broadcasters, schools, government and sponsors. Contact the studio or join the academy.",
};

const partnerTypes = [
  { title: "Broadcasters", copy: "Licensing and distribution for broadcast and streaming." },
  { title: "Schools", copy: "Educational packages and the Sesotho classroom series." },
  { title: "Government", copy: "Cultural preservation and archival partnerships." },
  { title: "Sponsors", copy: "Back the slate and reach the Basotho diaspora." },
];

export default function ContactPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 pb-24 pt-36 sm:px-8">
      <Reveal>
        <p className="eyebrow flex items-center gap-3">
          <span className="rule-fire" />
          Contact & Partners
        </p>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-metal sm:text-6xl">
          Let&apos;s build the industry
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-steel">
          Whether you&apos;re a broadcaster, a school, a funder or a future
          filmmaker — we want to hear from you.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <ContactForm />
        </Reveal>

        <div className="space-y-8">
          <Reveal delay={0.1}>
            <div className="card p-7">
              <p className="eyebrow">Direct</p>
              <a
                href={`mailto:${site.email}`}
                className="mt-3 block text-lg font-bold text-white transition-colors hover:text-ember"
              >
                {site.email}
              </a>
              <a
                href={`tel:${site.phone.replace(/\s+/g, "")}`}
                className="mt-2 block text-sm font-semibold text-silver-2 transition-colors hover:text-ember"
              >
                {site.phone}
              </a>
              <p className="mt-2 text-sm text-steel">{site.location}</p>
              <div className="mt-5 flex gap-3">
                {["Sesotho", "English"].map((l) => (
                  <span
                    key={l}
                    className="rounded-full border border-white/12 px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-silver-2"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="space-y-4">
              {partnerTypes.map((p) => (
                <div key={p.title} className="card p-5">
                  <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-silver">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-steel">{p.copy}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
