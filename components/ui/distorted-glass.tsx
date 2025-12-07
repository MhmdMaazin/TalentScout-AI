import { cn } from "@/lib/utils"

export const DistortedGlass = ({ className }: { className?: string }) => {
  return (
    <>
      <div
        className={cn(
          "relative hidden h-[50px] w-[360px] overflow-hidden rounded-b-2xl lg:w-[600px]  xl:block xl:w-full",
          className
        )}
      >
        <div className="pointer-events-none absolute bottom-0  z-10 size-full overflow-hidden rounded-b-2xl  border border-[#f5f5f51a]">
          <div className="glass-effect size-full"></div>
        </div>
        <svg>
          <title>Distorted Glass</title>
          <defs>
            <filter id="fractal-noise-glass">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.12 0.12"
                numOctaves="1"
                result="warp"
              ></feTurbulence>
              <feDisplacementMap
                xChannelSelector="R"
                yChannelSelector="G"
                scale="30"
                in="SourceGraphic"
                in2="warp"
              />
            </filter>
          </defs>
        </svg>
      </div>

      <style>{`
        .glass-effect {
          background: rgba(80, 80, 80, 0.4);
          background: repeating-radial-gradient(
            circle at 50%50%,
            rgb(100 100 100 / 0.1),
            rgba(120, 120, 120, 0.35) 10px,
            rgb(140 140 140 / 0.5) 31px
          );
          filter: url(#fractal-noise-glass);
          background-size: 6px 6px;
          backdrop-filter: blur(0px);
        }
      `}</style>
    </>
  )
}
