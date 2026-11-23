// Lucide icon paths, rendered inline like the utility-menu icons in Header.
const icons = {
  Innovation: (
    <>
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </>
  ),
  Transparency: (
    <>
      <path d="M12 3v18" />
      <path d="m19 8 3 8a5 5 0 0 1-6 0zV7" />
      <path d="M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1" />
      <path d="m5 8 3 8a5 5 0 0 1-6 0zV7" />
      <path d="M7 21h10" />
    </>
  ),
  Creativity: (
    <>
      <path d="m12.296 3.464 3.02 3.956" />
      <path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3z" />
      <path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="m6.18 5.276 3.1 3.899" />
    </>
  ),
  Autodidacticism: (
    <>
      <path d="M12 5v16" />
      <path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z" />
    </>
  ),
};

export default function ValueIcon({ value }) {
  return (
    <span aria-hidden="true" className="relative grid h-5 w-5 place-items-center">
      <span className="pointer-events-none absolute -inset-2 rounded-full bg-[radial-gradient(circle,rgba(255,69,0,0.22)_0%,transparent_70%)] opacity-75 transition-opacity duration-200 group-hover/value:opacity-100 motion-reduce:transition-none" />
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative h-5 w-5 text-ember drop-shadow-[0_0_3px_rgba(255,69,0,0.35)] transition-[color,filter] duration-200 group-hover/value:text-[#ff6a33] group-hover/value:drop-shadow-[0_0_4px_rgba(255,69,0,0.5)] motion-reduce:transition-none"
      >
        {icons[value]}
      </svg>
    </span>
  );
}
