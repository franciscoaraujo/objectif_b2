/* Bandeiras e símbolos em SVG (sem imagens externas, nítidos em qualquer tamanho). */

const CANADA_RED = "#D52B1E";
const QUEBEC_BLUE = "#003DA5";

/** Folha de bordo da bandeira do Canadá (desenho oficial, domínio público), centrada na origem. */
const MAPLE_PATH =
  "m-90 2030 45-863a95 95 0 0 0-111-98l-859 151 116-320a65 65 0 0 0-20-73l-941-762 212-99a65 65 0 0 0 34-79l-186-572 542 115a65 65 0 0 0 73-38l105-247 423 454a65 65 0 0 0 111-57l-204-1052 327 189a65 65 0 0 0 91-27l332-652 332 652a65 65 0 0 0 91 27l327-189-204 1052a65 65 0 0 0 111 57l423-454 105 247a65 65 0 0 0 73 38l542-115-186 572a65 65 0 0 0 34 79l212 99-941 762a65 65 0 0 0-20 73l116 320-859-151a95 95 0 0 0-111 98l45 863z";

export function MapleLeaf({ className = "", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="-2100 -2050 4200 4150" className={className} aria-hidden="true">
      <path d={MAPLE_PATH} fill={color} />
    </svg>
  );
}

export function CanadaFlag({ className = "", title = "Bandeira do Canadá" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 960 480" className={className} role="img" aria-label={title}>
      <rect width="960" height="480" fill="#fff" />
      <rect width="240" height="480" fill={CANADA_RED} />
      <rect x="720" width="240" height="480" fill={CANADA_RED} />
      <svg x="300" y="60" width="360" height="360" viewBox="-2100 -2050 4200 4150">
        <path d={MAPLE_PATH} fill={CANADA_RED} />
      </svg>
    </svg>
  );
}

/** Flor-de-lis estilizada numa caixa 100×100. */
function FleurDeLis({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <svg x={x} y={y} width={size} height={size} viewBox="0 0 100 100">
      <g fill="#fff">
        {/* pétala central */}
        <path d="M50 4C38 18 36 38 45 58h10c9-20 7-40-5-54z" />
        {/* pétalas laterais */}
        <path d="M45 60C38 36 14 32 8 46c-4 10 4 20 14 17-7-2-9-9-5-14 6-7 18-3 23 11z" />
        <path d="M55 60c7-24 31-28 37-14 4 10-4 20-14 17 7-2 9-9 5-14-6-7-18-3-23 11z" />
        {/* faixa */}
        <rect x="28" y="58" width="44" height="8" rx="2" />
        {/* base */}
        <path d="M45 66l-5 18c6-3 9 2 10 10 1-8 4-13 10-10l-5-18z" />
      </g>
    </svg>
  );
}

export function QuebecFlag({ className = "", title = "Bandeira do Quebec" }: { className?: string; title?: string }) {
  // Proporção 2:3; cruz branca com 1/6 da altura; flor-de-lis em cada quadrante.
  return (
    <svg viewBox="0 0 600 400" className={className} role="img" aria-label={title}>
      <rect width="600" height="400" fill={QUEBEC_BLUE} />
      <rect x="266.67" width="66.67" height="400" fill="#fff" />
      <rect y="166.67" width="600" height="66.67" fill="#fff" />
      <FleurDeLis x={68} y={18} size={130} />
      <FleurDeLis x={402} y={18} size={130} />
      <FleurDeLis x={68} y={252} size={130} />
      <FleurDeLis x={402} y={252} size={130} />
    </svg>
  );
}

/** Par de bandeiras Canadá + Quebec, lado a lado. */
export function Flags({ className = "h-4" }: { className?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <CanadaFlag className={`${className} w-auto rounded-[3px] shadow-sm ring-1 ring-black/10`} />
      <QuebecFlag className={`${className} w-auto rounded-[3px] shadow-sm ring-1 ring-black/10`} />
    </span>
  );
}
