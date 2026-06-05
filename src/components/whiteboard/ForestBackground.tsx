/** Firewatch-style forest backdrop (web port of Veridian org design). */
export function ForestBackground() {
  return (
    <div className="forestBg" aria-hidden="true">
      <svg className="forestSvg" viewBox="0 0 1440 520" preserveAspectRatio="none">
        <defs>
          <linearGradient id="forestSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F0F7F0" />
            <stop offset="55%" stopColor="#D8ECBE" />
            <stop offset="100%" stopColor="#BCD4BE" />
          </linearGradient>
        </defs>
        <rect width="1440" height="520" fill="url(#forestSky)" />
        <path
          fill="#C8DCC8"
          d="M0,280 C180,240 320,300 480,260 C640,220 820,290 960,250 C1100,210 1280,270 1440,230 L1440,520 L0,520 Z"
        />
        <path
          fill="#AED0AE"
          d="M0,320 C200,280 360,340 520,300 C680,260 860,330 1020,290 C1180,250 1320,310 1440,270 L1440,520 L0,520 Z"
        />
        <path
          fill="#88BE88"
          d="M0,360 C160,320 340,380 500,340 C660,300 840,370 1000,330 C1160,290 1300,350 1440,310 L1440,520 L0,520 Z"
        />
        <path
          fill="#58A258"
          d="M0,400 C140,360 300,420 460,380 C620,340 800,410 960,370 C1120,330 1280,390 1440,350 L1440,520 L0,520 Z"
        />
        <path
          fill="#358435"
          d="M0,440 C120,400 280,460 440,420 C600,380 780,450 940,410 C1100,370 1260,430 1440,390 L1440,520 L0,520 Z"
        />
        <path
          fill="#1C6420"
          d="M0,470 C100,440 260,490 420,460 C580,430 760,490 920,460 C1080,430 1240,480 1440,450 L1440,520 L0,520 Z"
        />
        <path
          fill="#0C3010"
          d="M0,500 L1440,500 L1440,520 L0,520 Z"
        />
      </svg>
    </div>
  );
}
