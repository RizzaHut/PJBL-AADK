import { useId } from "react";

interface GlitchFrameProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}

const PIXEL_PATH =
  "M216.288 98H336.13V50.1152H389.908V98H576.604V49H687.149V98H943.461V97.3457H997.775V146.67H946.565V280H1001.44V379H1001.29V430H946.565V511.848H1001.29V463H1055.29V512H1001.29V561.256H946.788V611H839.288V561H611.704V609.665H557.926V561H54.5654V378H0.288086V329H0V280H54.5654V195.409H1.28809V146.783H1.24805V97.375H54.3877V49.5742H108.388V98H162.288V49H216.288V98Z";

export default function GlitchFrame({
  src,
  alt,
  priority = false,
  className = "",
}: GlitchFrameProps) {
  const clipId = useId();

  return (
    <div className={`relative aspect-1056/659 w-full ${className}`}>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1056 659"
        preserveAspectRatio="none"
        role="img"
        aria-label={alt}
      >
        <defs>
          <clipPath id={clipId}>
            <path d={PIXEL_PATH} />
          </clipPath>
        </defs>
        <image
          href={src}
          x="0"
          y="0"
          width="1056"
          height="659"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
      </svg>
      <span className="sr-only">{alt}</span>
      {priority && <link rel="preload" as="image" href={src} />}
    </div>
  );
}
