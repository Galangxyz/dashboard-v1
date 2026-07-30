import Reveal from "./Reveal";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  light = false,
}) {
  const isCenter = align === "center";
  return (
    <div
      className={`max-w-2xl ${isCenter ? "mx-auto text-center" : "text-left"}`}
    >
      {eyebrow && (
        <Reveal>
          <span
            className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] ${
              light ? "text-[#b08960]" : "text-gold"
            }`}
          >
            <span className="h-px w-6 bg-current opacity-50" />
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={0.08}>
        <h2
          className={`mt-4 font-display text-4xl font-semibold leading-[1.1] sm:text-5xl ${
            light ? "text-[#F9F7F2]" : "text-[#1A1614]"
          }`}
        >
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={0.16}>
          <p
            className={`mt-5 text-base leading-relaxed ${
              light ? "text-[#E8DED1]/80" : "text-[#1A1614]/70"
            }`}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}