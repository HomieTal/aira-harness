import { cn } from "@/components/lib/utils.js";

export function AiraAboutLogo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="118"
      height="100"
      fill="none"
      viewBox="0 0 256 218"
      className={cn("shrink-0 text-current", className)}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M128 0L210.4 218L175.1 218L128 92.7L80.9 218L47.6 218Z"
      />
      <path fill="currentColor" d="M100 148.5H156A11.8 11.8 0 0 1 167.8 160.3V172.1A11.8 11.8 0 0 1 156 183.9H100A11.8 11.8 0 0 1 88.2 172.1V160.3A11.8 11.8 0 0 1 100 148.5Z" />
      <path
        fill="currentColor"
        d="M194 32A16 16 0 1 0 226 32A16 16 0 1 0 194 32Z"
      />
    </svg>
  );
}

export function AiraWordmarkLogo({ className }: { className?: string }) {
  return (
    <svg
      width="244"
      height="54"
      viewBox="0 0 244 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 text-current", className)}
      aria-hidden="true"
      focusable="false"
    >
      {/* Aira glyph: geometric A scaled to 54px height */}
      <g transform="scale(0.1824)">
        <path
          fill="currentColor"
          d="M256 108L368 404L320 404L256 234L192 404L144 404Z"
        />
        <rect fill="currentColor" x="202" y="310" width="108" height="32" rx="16" />
        <circle fill="currentColor" cx="378" cy="119" r="23" />
      </g>
      <text
        x="52"
        y="40"
        fill="currentColor"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontWeight="700"
        fontSize="42"
      >
        Aira
      </text>
    </svg>
  );
}

