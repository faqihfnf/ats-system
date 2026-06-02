"use client";

type Props = {
  name: string;
  token: string;
};

export function Watermark({ name, token }: Props) {
  const shortToken = token.slice(0, 6);
  const timestamp = new Date().toLocaleString("id-ID");
  const text = `${name} • ${shortToken} • ${timestamp}`;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -15deg,
            transparent,
            transparent 200px,
            rgba(0,0,0,0.02) 200px,
            rgba(0,0,0,0.02) 201px
          )`,
        }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute whitespace-nowrap text-[11px] text-slate-400"
            style={{
              top: `${(i * 120) % 1000}px`,
              left: `${((i * 300) % 1200) - 100}px`,
              transform: "rotate(-15deg)",
              opacity: 0.04,
              userSelect: "none",
            }}
          >
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}
