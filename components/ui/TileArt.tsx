import { useId } from "react";
import { hashSeed, luminance, mix, rng, shade } from "@/lib/color";
import type { PatternKey } from "@/lib/types";

interface Props {
  pattern: PatternKey;
  base: string;
  accent: string;
  seed?: string | number;
  className?: string;
  /** Draws grout lines so the swatch reads as a laid tile surface. */
  grout?: boolean;
  title?: string;
}

const f = (n: number) => Math.round(n * 100) / 100;

export function TileArt({ pattern, base, accent, seed = 1, className, grout = false, title }: Props) {
  const uid = useId().replace(/:/g, "");
  const r = rng(hashSeed(`${seed}-${pattern}-${base}`));
  const els: React.ReactNode[] = [];
  let defs: React.ReactNode = null;

  switch (pattern) {
    case "marble": {
      defs = (
        <>
          <radialGradient id={`${uid}g`} cx="30%" cy="25%" r="95%">
            <stop offset="0" stopColor={shade(base, 0.4)} stopOpacity=".7" />
            <stop offset="1" stopColor={shade(base, -0.14)} stopOpacity=".55" />
          </radialGradient>
          <filter id={`${uid}b`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2" /></filter>
          <filter id={`${uid}c`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency=".012 .02" numOctaves="3" seed={hashSeed(seed) % 80} />
            <feColorMatrix type="matrix" values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .9 -.28" />
          </filter>
        </>
      );
      els.push(
        <rect key="bg" width="200" height="200" fill={base} />,
        <rect key="gl" width="200" height="200" fill={`url(#${uid}g)`} />,
        <rect key="cl" width="200" height="200" filter={`url(#${uid}c)`} opacity=".35" />,
      );
      // fractal crack via midpoint displacement
      const crack = (x0: number, y0: number, x1: number, y1: number, rough: number, depth: number): [number, number][] => {
        let pts: [number, number][] = [[x0, y0], [x1, y1]];
        let amp = rough;
        for (let d = 0; d < depth; d++) {
          const next: [number, number][] = [];
          for (let i = 0; i < pts.length - 1; i++) {
            const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
            const mx = (ax + bx) / 2, my = (ay + by) / 2;
            const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
            const o = (r() - 0.5) * 2 * amp;
            next.push([ax, ay], [mx - (dy / len) * o, my + (dx / len) * o]);
          }
          next.push(pts[pts.length - 1]);
          pts = next; amp *= 0.52;
        }
        return pts;
      };
      const toPath = (pts: [number, number][]) => {
        let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
        for (let i = 1; i < pts.length - 1; i++) {
          const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
          d += `Q${f(pts[i][0])} ${f(pts[i][1])} ${f(mx)} ${f(my)}`;
        }
        return d;
      };
      const mains = 2 + Math.floor(r() * 2);
      const onDark = luminance(accent) > luminance(base);
      for (let i = 0; i < mains; i++) {
        const x0 = -10 + r() * 90, y0 = -10 + r() * 60, x1 = 120 + r() * 90, y1 = 120 + r() * 90;
        const pts = crack(x0, y0, x1, y1, 20 + r() * 12, 5);
        const w = 0.5 + r() * 1.1;
        els.push(
          <path key={`mb${i}`} d={toPath(pts)} fill="none" stroke={accent} strokeWidth={f(w * 6)} opacity={onDark ? 0.08 : 0.22} filter={`url(#${uid}b)`} strokeLinecap="round" />,
          <path key={`m${i}`} d={toPath(pts)} fill="none" stroke={accent} strokeWidth={f(w)} opacity={f((onDark ? 0.28 : 0.4) + r() * 0.3)} strokeLinejoin="round" strokeLinecap="round" />,
        );
        const branches = 3 + Math.floor(r() * 3);
        for (let k = 0; k < branches; k++) {
          const [sx, sy] = pts[Math.floor(r() * (pts.length - 4)) + 2];
          const ang = Math.atan2(y1 - y0, x1 - x0) + (r() - 0.5) * 2.2, len = 25 + r() * 55;
          const bp = crack(sx, sy, sx + Math.cos(ang) * len, sy + Math.sin(ang) * len, 9 + r() * 6, 4);
          els.push(<path key={`b${i}-${k}`} d={toPath(bp)} fill="none" stroke={accent} strokeWidth={f(0.22 + r() * 0.3)} opacity={f(0.22 + r() * 0.3)} strokeLinejoin="round" strokeLinecap="round" />);
        }
      }
      break;
    }
    case "terrazzo": {
      els.push(<rect key="bg" width="200" height="200" fill={base} />);
      const palette = [accent, shade(base, -0.35), shade(base, 0.5), mix(base, accent, 0.5), shade(accent, -0.3), "#ffffff"];
      for (let i = 0; i < 70; i++) {
        const cx = r() * 200, cy = r() * 200, sz = 2 + r() * (i % 9 === 0 ? 9 : 5);
        const sides = 5 + Math.floor(r() * 3);
        const pts = Array.from({ length: sides }, (_, k) => {
          const ang = (k / sides) * Math.PI * 2 + r() * 0.6;
          const rad = sz * (0.55 + r() * 0.6);
          return `${f(cx + Math.cos(ang) * rad)},${f(cy + Math.sin(ang) * rad)}`;
        }).join(" ");
        els.push(<polygon key={i} points={pts} fill={palette[Math.floor(r() * palette.length)]} opacity={f(0.7 + r() * 0.3)} />);
      }
      break;
    }
    case "wood": {
      const rows = 5, h = 200 / rows;
      for (let i = 0; i < rows; i++) {
        const tone = shade(base, (r() - 0.5) * 0.18);
        const offset = r() * 120;
        for (const [x0, x1] of [[-200 + offset, offset], [offset, 200 + offset]] as const) {
          const cx0 = Math.max(0, x0), cx1 = Math.min(200, x1);
          if (cx1 <= cx0) continue;
          const t2 = shade(tone, (r() - 0.5) * 0.14);
          els.push(<rect key={`p${i}-${x0}`} x={f(cx0)} y={f(i * h)} width={f(cx1 - cx0)} height={f(h)} fill={t2} />);
          for (let k = 0; k < 7; k++) {
            const y = i * h + 2 + r() * (h - 4);
            const amp = 0.8 + r() * 2;
            els.push(<path key={`g${i}-${x0}-${k}`} d={`M${f(cx0)} ${f(y)} q${f((cx1 - cx0) / 4)} ${f(-amp)} ${f((cx1 - cx0) / 2)} 0 t${f((cx1 - cx0) / 2)} 0`} stroke={accent} strokeWidth={f(0.25 + r() * 0.5)} fill="none" opacity={f(0.25 + r() * 0.35)} />);
          }
          els.push(<rect key={`s${i}-${x0}`} x={f(cx0)} y={f(i * h)} width={f(cx1 - cx0)} height={f(h)} fill="none" stroke={shade(base, -0.4)} strokeWidth="0.7" opacity=".55" />);
        }
      }
      break;
    }
    case "geometric": {
      els.push(<rect key="bg" width="200" height="200" fill={base} />);
      const n = 4, s = 200 / n;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const x = i * s, y = j * s, c = s / 2;
        const flip = (i + j) % 2 === 0;
        els.push(
          <g key={`${i}-${j}`} transform={`translate(${x} ${y})`}>
            <rect x="2" y="2" width={s - 4} height={s - 4} fill="none" stroke={accent} strokeWidth="1" opacity=".5" />
            <path d={`M${c} 4 L${s - 4} ${c} L${c} ${s - 4} L4 ${c} Z`} fill={flip ? accent : "none"} stroke={accent} strokeWidth="1.2" opacity={flip ? 0.9 : 0.7} />
            <circle cx={c} cy={c} r={s * 0.16} fill={flip ? base : accent} opacity={flip ? 1 : 0.85} />
            {[[0, 0], [s, 0], [0, s], [s, s]].map(([qx, qy], k) => (
              <path key={k} d={`M${qx} ${qy} Q${qx === 0 ? s * 0.28 : s * 0.72} ${qy === 0 ? s * 0.28 : s * 0.72} ${qx === 0 ? 0 : s} ${qy === 0 ? s * 0.34 : s * 0.66}`} fill="none" stroke={accent} strokeWidth="1" opacity=".55" />
            ))}
          </g>,
        );
      }
      break;
    }
    case "hex": {
      els.push(<rect key="bg" width="200" height="200" fill={shade(base, -0.25)} />);
      const sz = 22, w = Math.sqrt(3) * sz, v = sz * 1.5;
      for (let row = -1; row < 200 / v + 1; row++) for (let col = -1; col < 200 / w + 1; col++) {
        const cx = col * w + (row % 2 ? w / 2 : 0), cy = row * v;
        const pts = Array.from({ length: 6 }, (_, k) => {
          const a = (Math.PI / 180) * (60 * k - 30);
          return `${f(cx + (sz - 1.2) * Math.cos(a))},${f(cy + (sz - 1.2) * Math.sin(a))}`;
        }).join(" ");
        els.push(<polygon key={`${row}-${col}`} points={pts} fill={shade(base, (r() - 0.5) * 0.12)} stroke={accent} strokeWidth="0.5" opacity=".98" />);
      }
      break;
    }
    case "subway": {
      els.push(<rect key="bg" width="200" height="200" fill={accent} />);
      const tw = 50, th = 25;
      for (let row = 0; row < 8; row++) for (let col = -1; col < 5; col++) {
        const x = col * tw + (row % 2 ? tw / 2 : 0) + 1, y = row * th + 1;
        els.push(
          <rect key={`${row}-${col}`} x={x} y={y} width={tw - 2} height={th - 2} rx="1.6" fill={shade(base, (r() - 0.5) * 0.05)} />,
          <rect key={`h${row}-${col}`} x={x + 1} y={y + 1} width={tw - 4} height="2.2" rx="1" fill="#fff" opacity=".7" />,
        );
      }
      break;
    }
    case "slate":
    case "cement": {
      defs = (
        <filter id={`${uid}f`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency={pattern === "slate" ? 0.04 : 0.022} numOctaves="4" seed={hashSeed(seed) % 90} result="n" />
          <feColorMatrix in="n" type="matrix" values={`0 0 0 0 ${0}  0 0 0 0 ${0}  0 0 0 0 ${0}  0 0 0 ${pattern === "slate" ? 0.9 : 0.55} -0.18`} />
        </filter>
      );
      els.push(<rect key="bg" width="200" height="200" fill={base} />);
      els.push(<rect key="n" width="200" height="200" filter={`url(#${uid}f)`} opacity={pattern === "slate" ? 0.5 : 0.38} />);
      for (let i = 0; i < 9; i++) {
        els.push(<ellipse key={i} cx={f(r() * 200)} cy={f(r() * 200)} rx={f(18 + r() * 40)} ry={f(10 + r() * 26)} fill={i % 2 ? accent : shade(base, 0.35)} opacity={f(0.12 + r() * 0.16)} transform={`rotate(${f(r() * 180)} 100 100)`} />);
      }
      if (pattern === "slate") {
        for (let i = 0; i < 12; i++) els.push(<path key={`c${i}`} d={`M${f(r() * 200)} ${f(r() * 200)} l${f((r() - 0.5) * 50)} ${f((r() - 0.5) * 50)}`} stroke={accent} strokeWidth=".6" opacity=".5" />);
      }
      break;
    }
    case "herringbone": {
      const light = shade(base, 0.08), dark = shade(base, -0.1), edge = shade(base, -0.42);
      defs = (
        <pattern id={`${uid}h`} width="50" height="20" patternUnits="userSpaceOnUse">
          {[0, -20].map((dy) => (
            <g key={dy} transform={`translate(0 ${dy})`} stroke={edge} strokeWidth=".8" strokeLinejoin="round">
              <polygon points="0,0 25,12.5 25,32.5 0,20" fill={light} />
              <polygon points="25,12.5 50,0 50,20 25,32.5" fill={dark} />
            </g>
          ))}
        </pattern>
      );
      els.push(<rect key="bg" width="200" height="200" fill={edge} />, <rect key="p" width="200" height="200" fill={`url(#${uid}h)`} />);
      for (let i = 0; i < 22; i++) {
        const x = r() * 190, y = r() * 195;
        els.push(<path key={i} d={`M${f(x)} ${f(y)} q8 -1.5 16 0`} stroke={accent} strokeWidth=".45" fill="none" opacity=".45" />);
      }
      break;
    }
    case "door":
    case "sanitary":
    case "basin":
    case "tap":
    case "mirror":
    case "paint":
    case "hardware":
    case "accessory": {
      const ink = accent, soft = shade(base, -0.06), edge = shade(accent, -0.15), hi = shade(base, 0.6);
      defs = (
        <radialGradient id={`${uid}g`} cx="50%" cy="38%" r="80%">
          <stop offset="0" stopColor="#fff" stopOpacity=".9" />
          <stop offset="1" stopColor={shade(base, -0.1)} stopOpacity=".55" />
        </radialGradient>
      );
      els.push(<rect key="bg" width="200" height="200" fill={base} />, <rect key="gl" width="200" height="200" fill={`url(#${uid}g)`} />);
      const g: React.ReactNode[] = [];
      if (pattern === "door") {
        g.push(<rect key="a" x="62" y="26" width="76" height="150" rx="3" fill={soft} stroke={ink} strokeWidth="3" />,
          <rect key="b" x="72" y="38" width="56" height="50" rx="2" fill="none" stroke={edge} strokeWidth="2" />,
          <rect key="c" x="72" y="98" width="56" height="66" rx="2" fill="none" stroke={edge} strokeWidth="2" />,
          <circle key="d" cx="124" cy="104" r="4.5" fill={ink} />);
      } else if (pattern === "sanitary") {
        g.push(<rect key="a" x="68" y="34" width="64" height="42" rx="8" fill={hi} stroke={ink} strokeWidth="3" />,
          <path key="b" d="M56 92h88c0 26-16 44-44 44S56 118 56 92Z" fill={hi} stroke={ink} strokeWidth="3" />,
          <ellipse key="c" cx="100" cy="92" rx="44" ry="9" fill={soft} stroke={ink} strokeWidth="3" />,
          <path key="d" d="M86 136h28l6 26H80Z" fill={hi} stroke={ink} strokeWidth="3" strokeLinejoin="round" />,
          <circle key="e" cx="100" cy="44" r="4" fill={ink} />);
      } else if (pattern === "basin") {
        g.push(<path key="a" d="M54 70h92c0 30-18 48-46 48S54 100 54 70Z" fill={hi} stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />,
          <ellipse key="b" cx="100" cy="70" rx="46" ry="9" fill={soft} stroke={ink} strokeWidth="3.5" />,
          <path key="c" d="M86 116h28l8 50H78Z" fill={hi} stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />,
          <path key="d" d="M70 168h60" stroke={ink} strokeWidth="4" strokeLinecap="round" />,
          <path key="e" d="M100 70V44h14" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />);
      } else if (pattern === "tap") {
        g.push(<path key="a" d="M100 150V92q0-26 28-26h24" fill="none" stroke={ink} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />,
          <rect key="b" x="82" y="146" width="36" height="14" rx="4" fill={ink} />,
          <path key="c" d="M100 100h-30" stroke={ink} strokeWidth="9" strokeLinecap="round" />,
          <path key="d" d="M152 74v14" stroke={edge} strokeWidth="4" strokeLinecap="round" />,
          <path key="e" d="M60 168c10-12 30-12 40 0s30 12 40 0" fill="none" stroke={edge} strokeWidth="3" opacity=".5" />);
      } else if (pattern === "mirror") {
        g.push(<rect key="a" x="46" y="26" width="108" height="148" rx="12" fill={hi} stroke={ink} strokeWidth="7" />,
          <path key="b" d="M70 150 118 44h18L88 150Z" fill="#fff" opacity=".7" />,
          <path key="c" d="M104 150 134 84h8l-30 66Z" fill="#fff" opacity=".5" />);
      } else if (pattern === "paint") {
        g.push(<path key="a" d="M64 74c0-12 72-12 72 0v82c0 12-72 12-72 0Z" fill={hi} stroke={ink} strokeWidth="3" />,
          <rect key="b" x="64" y="96" width="72" height="34" fill={ink} opacity=".9" />,
          <ellipse key="c" cx="100" cy="74" rx="36" ry="9" fill={soft} stroke={ink} strokeWidth="3" />,
          <path key="d" d="M64 78c-4-30 72-30 72 0" fill="none" stroke={edge} strokeWidth="3" />);
      } else if (pattern === "hardware") {
        g.push(<path key="a" d="M78 96V76a22 22 0 0 1 44 0v20" fill="none" stroke={ink} strokeWidth="9" strokeLinecap="round" />,
          <rect key="b" x="62" y="92" width="76" height="62" rx="11" fill={hi} stroke={ink} strokeWidth="4" />,
          <circle key="c" cx="100" cy="120" r="7" fill={ink} />, <path key="d" d="M100 124v14" stroke={ink} strokeWidth="5" strokeLinecap="round" />);
      } else {
        for (const [x, y, sz] of [[70, 76, 22], [128, 70, 18], [96, 130, 26], [140, 128, 16]] as const)
          g.push(<path key={`${x}${y}`} d={`M${x - sz} ${y}h${sz * 2}M${x} ${y - sz}v${sz * 2}`} stroke={ink} strokeWidth="7" strokeLinecap="round" />);
      }
      els.push(<g key="glyph" transform="translate(0 4)">{g}</g>);
      break;
    }
    case "zellige":
    default: {
      defs = (
        <radialGradient id={`${uid}z`} cx="30%" cy="28%" r="85%">
          <stop offset="0" stopColor="#fff" stopOpacity=".5" />
          <stop offset=".55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".16" />
        </radialGradient>
      );
      els.push(<rect key="bg" width="200" height="200" fill={accent} />);
      const n = 5, s = 200 / n;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const t = shade(base, (r() - 0.5) * 0.14);
        els.push(
          <rect key={`${i}-${j}`} x={i * s + 1.6} y={j * s + 1.6} width={s - 3.2} height={s - 3.2} rx="2.4" fill={t} />,
          <rect key={`g${i}-${j}`} x={i * s + 1.6} y={j * s + 1.6} width={s - 3.2} height={s - 3.2} rx="2.4" fill={`url(#${uid}z)`} transform={`rotate(${Math.floor(r() * 4) * 90} ${i * s + s / 2} ${j * s + s / 2})`} />,
        );
      }
      break;
    }
  }

  return (
    <svg
      viewBox="0 0 200 200"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {defs && <defs>{defs}</defs>}
      {els}
      {grout && (
        <g stroke={shade(base, -0.45)} strokeWidth="1.4" opacity=".35">
          <path d="M100 0V200M0 100H200" />
        </g>
      )}
    </svg>
  );
}
