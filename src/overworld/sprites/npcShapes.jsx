// ── NPC pixel art shapes ───────────────────────────────────────────────────
// Each function returns SVG <rect> elements for an 8x16 pixel art character.
// viewBox="0 0 8 16" — each unit = 1 "pixel".
// All are pure render functions (no hooks/state).

const SVG_PROPS = {
  viewBox: '0 0 8 16',
  xmlns: 'http://www.w3.org/2000/svg',
  style: { imageRendering: 'pixelated', width: '100%', height: '100%' },
}

// ── WANDERER — old wizard with pointy hat, white beard, staff ──────────────
export function WandererSprite() {
  return (
    <svg {...SVG_PROPS}>
      {/* Pointy hat */}
      <rect x="3" y="0" width="2" height="1" fill="#2a1a4a"/>
      <rect x="2" y="1" width="4" height="1" fill="#3a2a5a"/>
      <rect x="1" y="2" width="6" height="1" fill="#4a3a6a"/>
      <rect x="1" y="3" width="6" height="1" fill="#5a4a7a"/>
      {/* Hat brim highlight */}
      <rect x="1" y="3" width="6" height="1" fill="#6a3a8a"/>
      {/* White hair sides */}
      <rect x="1" y="4" width="1" height="3" fill="#e8e8f0"/>
      <rect x="6" y="4" width="1" height="3" fill="#e8e8f0"/>
      {/* Face */}
      <rect x="2" y="4" width="4" height="3" fill="#f5c5a3"/>
      {/* Eyes — old squint (wide) */}
      <rect x="2" y="5" width="2" height="1" fill="#2a1a0a"/>
      <rect x="4" y="5" width="2" height="1" fill="#2a1a0a"/>
      {/* Nose */}
      <rect x="3" y="6" width="2" height="1" fill="#d4a080"/>
      {/* White beard — wide block */}
      <rect x="1" y="7" width="6" height="4" fill="#e8e8f0"/>
      {/* Robe over beard sides */}
      <rect x="1" y="7" width="1" height="5" fill="#6a3a8a"/>
      <rect x="6" y="7" width="1" height="5" fill="#6a3a8a"/>
      {/* Robe body (below beard) */}
      <rect x="1" y="11" width="6" height="5" fill="#6a3a8a"/>
      {/* Robe highlight stripe */}
      <rect x="3" y="11" width="2" height="5" fill="#7a4a9a"/>
      {/* Staff — right side, thin vertical */}
      <rect x="7" y="3" width="1" height="13" fill="#7a5530"/>
      {/* Staff orb */}
      <rect x="6" y="3" width="2" height="2" fill="#d4a0f0"/>
      <rect x="7" y="2" width="1" height="1" fill="#c080e0"/>
      {/* Boots */}
      <rect x="1" y="14" width="2" height="2" fill="#3a2510"/>
      <rect x="5" y="14" width="2" height="2" fill="#3a2510"/>
    </svg>
  )
}

// ── INVARIANT — scholar with glasses, gray hair, brown robe, scroll ─────────
export function InvariantSprite() {
  return (
    <svg {...SVG_PROPS}>
      {/* Gray hair top */}
      <rect x="1" y="0" width="6" height="2" fill="#9a9aaa"/>
      {/* Hair sides */}
      <rect x="1" y="2" width="1" height="3" fill="#9a9aaa"/>
      <rect x="6" y="2" width="1" height="3" fill="#9a9aaa"/>
      {/* Face */}
      <rect x="2" y="2" width="4" height="4" fill="#f5c5a3"/>
      {/* Glasses frame */}
      <rect x="2" y="3" width="2" height="2" fill="#6a6a7a"/>
      <rect x="4" y="3" width="2" height="2" fill="#6a6a7a"/>
      <rect x="3" y="3" width="1" height="1" fill="#6a6a7a"/>   {/* bridge */}
      {/* Eyes behind glasses */}
      <rect x="2" y="4" width="2" height="1" fill="#2a2a3a"/>
      <rect x="4" y="4" width="2" height="1" fill="#2a2a3a"/>
      {/* Lens tint */}
      <rect x="2" y="3" width="2" height="1" fill="rgba(100,160,220,0.3)"/>
      <rect x="4" y="3" width="2" height="1" fill="rgba(100,160,220,0.3)"/>
      {/* Mouth */}
      <rect x="3" y="5" width="2" height="1" fill="#c8826a"/>
      {/* Brown robe body */}
      <rect x="1" y="6" width="5" height="6" fill="#7a5530"/>
      <rect x="2" y="7" width="3" height="4" fill="#8a6540"/>   {/* robe lighter front */}
      {/* Scroll in right hand */}
      <rect x="6" y="6" width="2" height="5" fill="#d4b483"/>
      <rect x="6" y="6" width="2" height="1" fill="#b89060"/>   {/* top cap */}
      <rect x="6" y="10" width="2" height="1" fill="#b89060"/>  {/* bottom cap */}
      {/* Scroll lines */}
      <rect x="6" y="7" width="2" height="1" fill="#c4a473"/>
      <rect x="6" y="9" width="2" height="1" fill="#c4a473"/>
      {/* Robe lower / legs covered */}
      <rect x="1" y="12" width="5" height="4" fill="#6a4520"/>
      {/* Feet */}
      <rect x="1" y="14" width="2" height="2" fill="#3a2510"/>
      <rect x="3" y="14" width="2" height="2" fill="#3a2510"/>
    </svg>
  )
}

// ── STACK — knight in full gray armor with sword ───────────────────────────
export function StackSprite() {
  return (
    <svg {...SVG_PROPS}>
      {/* Helmet top */}
      <rect x="1" y="0" width="6" height="1" fill="#4a5a6a"/>
      <rect x="1" y="1" width="6" height="3" fill="#7a8a9a"/>
      {/* Helmet visor slit */}
      <rect x="2" y="2" width="4" height="1" fill="#1a2a3a"/>
      <rect x="2" y="3" width="4" height="1" fill="#2a3a4a"/>
      {/* Visor shine */}
      <rect x="2" y="2" width="4" height="1" fill="#c8d8e8"/>
      {/* Neck guard */}
      <rect x="2" y="4" width="4" height="1" fill="#5a6a7a"/>
      {/* Chest plate */}
      <rect x="1" y="5" width="6" height="5" fill="#7a8a9a"/>
      <rect x="2" y="5" width="4" height="4" fill="#9aaaba"/>   {/* center brighter */}
      <rect x="3" y="5" width="2" height="4" fill="#b8c8d8"/>   {/* shine strip */}
      {/* Shoulder pauldrons */}
      <rect x="0" y="5" width="1" height="3" fill="#6a7a8a"/>
      <rect x="7" y="5" width="1" height="3" fill="#6a7a8a"/>
      {/* Sword — right side */}
      <rect x="7" y="4" width="1" height="8" fill="#c8d8e8"/>   {/* blade */}
      <rect x="6" y="7" width="3" height="1" fill="#7a5530"/>   {/* crossguard */}
      <rect x="7" y="11" width="1" height="3" fill="#5a4a3a"/>  {/* grip */}
      <rect x="7" y="14" width="1" height="1" fill="#3a2a1a"/>  {/* pommel */}
      {/* Waist/hip plate */}
      <rect x="1" y="10" width="6" height="2" fill="#5a6a7a"/>
      {/* Leg armor */}
      <rect x="1" y="12" width="2" height="4" fill="#7a8a9a"/>
      <rect x="5" y="12" width="2" height="4" fill="#7a8a9a"/>
      <rect x="2" y="12" width="1" height="4" fill="#8a9aaa"/>  {/* leg highlight */}
      <rect x="5" y="12" width="1" height="4" fill="#8a9aaa"/>
      {/* Sabatons / boots */}
      <rect x="1" y="14" width="2" height="2" fill="#5a6a7a"/>
      <rect x="5" y="14" width="2" height="2" fill="#5a6a7a"/>
    </svg>
  )
}

// ── BYTE — tiny cute chick creature ───────────────────────────────────────
export function ByteSprite() {
  return (
    <svg {...SVG_PROPS}>
      {/* Empty rows 0-4 (small creature, lots of space above) */}
      {/* Round chick head */}
      <rect x="2" y="4" width="4" height="1" fill="#e8c05a"/>
      <rect x="1" y="5" width="6" height="3" fill="#e8c05a"/>
      <rect x="2" y="8" width="4" height="1" fill="#e8c05a"/>
      {/* Cute big eyes */}
      <rect x="2" y="5" width="2" height="2" fill="#f8f8f8"/>   {/* white left */}
      <rect x="4" y="5" width="2" height="2" fill="#f8f8f8"/>   {/* white right */}
      <rect x="2" y="6" width="1" height="1" fill="#2a1a0a"/>   {/* pupil left */}
      <rect x="5" y="6" width="1" height="1" fill="#2a1a0a"/>   {/* pupil right */}
      <rect x="2" y="5" width="1" height="1" fill="#fafaff"/>   {/* specular L */}
      <rect x="5" y="5" width="1" height="1" fill="#fafaff"/>   {/* specular R */}
      {/* Beak */}
      <rect x="3" y="7" width="2" height="1" fill="#e8a030"/>
      {/* Chick body — round, slightly wider */}
      <rect x="1" y="9" width="6" height="4" fill="#f0d070"/>
      <rect x="0" y="10" width="1" height="2" fill="#e8c05a"/>  {/* wing nub L */}
      <rect x="7" y="10" width="1" height="2" fill="#e8c05a"/>  {/* wing nub R */}
      {/* Bottom belly lighter */}
      <rect x="2" y="11" width="4" height="2" fill="#f8e090"/>
      {/* Tiny feet */}
      <rect x="2" y="13" width="1" height="2" fill="#e8a030"/>
      <rect x="5" y="13" width="1" height="2" fill="#e8a030"/>
      {/* Toe nubs */}
      <rect x="1" y="14" width="1" height="1" fill="#e8a030"/>
      <rect x="3" y="14" width="1" height="1" fill="#e8a030"/>
      <rect x="4" y="14" width="1" height="1" fill="#e8a030"/>
      <rect x="6" y="14" width="1" height="1" fill="#e8a030"/>
    </svg>
  )
}

// ── THREAD — fighter with red bandana, sleeveless tunic, fist wraps ────────
export function ThreadSprite() {
  return (
    <svg {...SVG_PROPS}>
      {/* Black hair */}
      <rect x="1" y="0" width="6" height="2" fill="#1a1a2a"/>
      <rect x="1" y="2" width="1" height="2" fill="#1a1a2a"/>
      <rect x="6" y="2" width="1" height="2" fill="#1a1a2a"/>
      {/* Red bandana */}
      <rect x="1" y="2" width="6" height="2" fill="#c83030"/>
      {/* Bandana knot / tail right side */}
      <rect x="6" y="1" width="2" height="3" fill="#a82020"/>
      <rect x="7" y="1" width="1" height="2" fill="#c83030"/>
      {/* Face — slightly tanned */}
      <rect x="2" y="4" width="4" height="3" fill="#d4a080"/>
      {/* Eyes — stern narrow */}
      <rect x="2" y="5" width="1" height="1" fill="#2a1a0a"/>
      <rect x="5" y="5" width="1" height="1" fill="#2a1a0a"/>
      {/* Brow furrow */}
      <rect x="2" y="4" width="2" height="1" fill="#c09070"/>
      <rect x="4" y="4" width="2" height="1" fill="#c09070"/>
      {/* Scar */}
      <rect x="4" y="4" width="1" height="3" fill="#b87060"/>
      {/* Nose */}
      <rect x="3" y="6" width="2" height="1" fill="#c49070"/>
      {/* Mouth — firm */}
      <rect x="3" y="6" width="2" height="1" fill="#b07060"/>
      {/* Sleeveless blue tunic */}
      <rect x="2" y="7" width="4" height="4" fill="#3a6bc8"/>
      <rect x="3" y="7" width="2" height="4" fill="#4a7bd8"/>   {/* tunic highlight */}
      {/* Bare arms — skin */}
      <rect x="1" y="7" width="1" height="4" fill="#d4a080"/>
      <rect x="6" y="7" width="1" height="4" fill="#d4a080"/>
      {/* Fist wraps */}
      <rect x="0" y="8" width="1" height="3" fill="#e8e8e0"/>
      <rect x="7" y="8" width="1" height="3" fill="#e8e8e0"/>
      {/* Wrap tape lines */}
      <rect x="0" y="9" width="1" height="1" fill="#d8d8d0"/>
      <rect x="7" y="9" width="1" height="1" fill="#d8d8d0"/>
      {/* Belt */}
      <rect x="1" y="11" width="6" height="1" fill="#4a2a10"/>
      {/* Dark pants */}
      <rect x="1" y="12" width="2" height="4" fill="#2a2a3a"/>
      <rect x="5" y="12" width="2" height="4" fill="#2a2a3a"/>
      {/* Boots */}
      <rect x="1" y="14" width="2" height="2" fill="#3a2510"/>
      <rect x="5" y="14" width="2" height="2" fill="#3a2510"/>
    </svg>
  )
}

// ── PROFILER — merchant/magistrate with top hat, green coat, scales ─────────
export function ProfilerSprite() {
  return (
    <svg {...SVG_PROPS}>
      {/* Top hat */}
      <rect x="2" y="0" width="4" height="3" fill="#1a1a2a"/>
      <rect x="2" y="0" width="4" height="1" fill="#2a2a3a"/>   {/* hat top */}
      <rect x="1" y="3" width="6" height="1" fill="#2a2a3a"/>   {/* hat brim */}
      {/* Side hair (curly, brown) */}
      <rect x="1" y="4" width="1" height="2" fill="#5c3d1e"/>
      <rect x="6" y="4" width="1" height="2" fill="#5c3d1e"/>
      {/* Face */}
      <rect x="2" y="4" width="4" height="3" fill="#f5c5a3"/>
      {/* Eyes */}
      <rect x="2" y="5" width="1" height="1" fill="#2a1a0a"/>
      <rect x="5" y="5" width="1" height="1" fill="#2a1a0a"/>
      {/* Mustache */}
      <rect x="2" y="6" width="4" height="1" fill="#5c3d1e"/>
      {/* Smile under mustache */}
      <rect x="3" y="6" width="2" height="1" fill="#c8826a"/>
      {/* Green merchant coat */}
      <rect x="1" y="7" width="6" height="5" fill="#2a6a2a"/>
      <rect x="2" y="7" width="1" height="5" fill="#3a8a3a"/>   {/* left lapel */}
      <rect x="5" y="7" width="1" height="5" fill="#3a8a3a"/>   {/* right lapel */}
      <rect x="3" y="8" width="2" height="4" fill="#1a4a1a"/>   {/* coat gap / vest */}
      {/* Gold button */}
      <rect x="3" y="9" width="2" height="1" fill="#c8a840"/>
      {/* Scale apparatus — left hand */}
      <rect x="0" y="8" width="1" height="6" fill="#7a5530"/>   {/* scale pole */}
      <rect x="0" y="9" width="3" height="1" fill="#c8a840"/>   {/* scale arm */}
      <rect x="0" y="10" width="1" height="2" fill="#c8a840"/>  {/* left pan */}
      <rect x="2" y="10" width="1" height="2" fill="#c8a840"/>  {/* right pan */}
      {/* Money bag — right hand */}
      <rect x="7" y="9" width="1" height="3" fill="#c8a840"/>
      <rect x="7" y="8" width="1" height="1" fill="#b89030"/>   {/* bag knot */}
      {/* Wide coat/pants lower */}
      <rect x="1" y="12" width="6" height="4" fill="#1a4a1a"/>
      {/* Boots */}
      <rect x="1" y="14" width="2" height="2" fill="#3a2510"/>
      <rect x="5" y="14" width="2" height="2" fill="#3a2510"/>
    </svg>
  )
}

// ── NULL NURSE — healer with white coif, red cross, healing staff ───────────
export function NullNurseSprite() {
  return (
    <svg {...SVG_PROPS}>
      {/* White coif / headband */}
      <rect x="1" y="0" width="6" height="2" fill="#e8e8f0"/>
      <rect x="1" y="2" width="1" height="3" fill="#e8e8f0"/>
      <rect x="6" y="2" width="1" height="3" fill="#e8e8f0"/>
      {/* Red cross on coif */}
      <rect x="3" y="0" width="2" height="2" fill="#c83030"/>
      <rect x="2" y="0" width="4" height="1" fill="#c83030"/>
      {/* Gentle light-brown hair peeking out */}
      <rect x="1" y="4" width="1" height="2" fill="#c8a070"/>
      <rect x="6" y="4" width="1" height="2" fill="#c8a070"/>
      {/* Face */}
      <rect x="2" y="2" width="4" height="4" fill="#f5c5a3"/>
      {/* Kind eyes */}
      <rect x="2" y="3" width="1" height="1" fill="#4a3a0a"/>
      <rect x="5" y="3" width="1" height="1" fill="#4a3a0a"/>
      {/* Cheek blush */}
      <rect x="2" y="4" width="1" height="1" fill="#e8a0a0"/>
      <rect x="5" y="4" width="1" height="1" fill="#e8a0a0"/>
      {/* Gentle smile */}
      <rect x="3" y="5" width="2" height="1" fill="#e88aaa"/>
      {/* White healer's robe */}
      <rect x="1" y="6" width="6" height="6" fill="#e8e8f0"/>
      {/* Red cross on chest */}
      <rect x="3" y="7" width="2" height="4" fill="#c83030"/>
      <rect x="2" y="8" width="4" height="2" fill="#c83030"/>
      {/* Robe collar */}
      <rect x="2" y="6" width="4" height="1" fill="#d8d8e0"/>
      {/* Healing staff — left side */}
      <rect x="0" y="6" width="1" height="10" fill="#5a8a5a"/>
      {/* Orb at top of staff */}
      <rect x="0" y="4" width="2" height="2" fill="#22c55e"/>
      <rect x="0" y="5" width="2" height="2" fill="#16a34a"/>
      {/* Orb glow pixel */}
      <rect x="0" y="4" width="1" height="1" fill="#4ade80"/>
      {/* Robe skirt lower */}
      <rect x="1" y="12" width="6" height="4" fill="#e8e8f0"/>
      {/* Sandals */}
      <rect x="2" y="14" width="2" height="2" fill="#c8a840"/>
      <rect x="4" y="14" width="2" height="2" fill="#c8a840"/>
      {/* Sandal straps */}
      <rect x="2" y="14" width="2" height="1" fill="#b89030"/>
      <rect x="4" y="14" width="2" height="1" fill="#b89030"/>
    </svg>
  )
}
