// Shared OpenCAT design tokens and primitives
// All components share these tokens; matches the design brief 1:1.

const OC = {
  // Teal accent
  teal50: '#F0FDFA',
  teal100: '#CCFBF1',
  teal200: '#99F6E4',
  teal300: '#5EEAD4',
  teal400: '#2DD4BF',
  teal500: '#14B8A6',
  teal600: '#0D9488',
  teal700: '#0F766E',
  // Warm stone
  stone50: '#FAFAF9',
  stone100: '#F5F5F4',
  stone200: '#E7E5E4',
  stone300: '#D6D3D1',
  stone400: '#A8A29E',
  stone500: '#78716C',
  stone600: '#57534E',
  stone700: '#44403C',
  stone800: '#292524',
  stone900: '#1C1917',
  white: '#FFFFFF',
  // Semantic
  green100: '#DCFCE7', green500: '#22C55E', green600: '#16A34A', green700: '#15803D',
  emerald100: '#D1FAE5', emerald600: '#059669', emerald700: '#047857',
  amber50: '#FFFBEB', amber100: '#FEF3C7', amber400: '#FBBF24', amber500: '#F59E0B', amber600: '#D97706', amber700: '#B45309',
  red50: '#FEF2F2', red100: '#FEE2E2', red400: '#F87171', red500: '#EF4444', red600: '#DC2626', red700: '#B91C1C',
  violet100: '#EDE9FE', violet200: '#DDD6FE', violet500: '#8B5CF6', violet600: '#7C3AED', violet700: '#6D28D9',
  sky50: '#F0F9FF', sky200: '#BAE6FD', sky600: '#0284C7', sky700: '#0369A1',
  indigo50: '#EEF2FF', indigo500: '#6366F1', indigo600: '#4F46E5',
  font: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', ui-monospace, 'Menlo', monospace",
};

// ─────────────────────────────────────────────────────────────
// Lucide-inspired icons (drawn as SVG; consistent stroke-width 1.75)
// Only the icons referenced in the brief.
// ─────────────────────────────────────────────────────────────
function Icon({ d, size = 18, color = 'currentColor', stroke = 1.75, fill = 'none', children, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}>
      {d ? <path d={d} /> : children}
    </svg>
  );
}
const I = {
  Dashboard: (p) => <Icon {...p}><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></Icon>,
  Folder:    (p) => <Icon {...p}><path d="M6 4h4l2 3h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></Icon>,
  Database:  (p) => <Icon {...p}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v6c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 11v6c0 1.66 4 3 9 3s9-1.34 9-3v-6"/></Icon>,
  Book:      (p) => <Icon {...p}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></Icon>,
  Settings:  (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Icon>,
  Upload:    (p) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></Icon>,
  Download:  (p) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></Icon>,
  Pencil:    (p) => <Icon {...p}><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></Icon>,
  Shield:    (p) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></Icon>,
  Warning:   (p) => <Icon {...p}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Icon>,
  Check:     (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 16 10"/></Icon>,
  CheckSm:   (p) => <Icon {...p}><polyline points="20 6 9 17 4 12"/></Icon>,
  Loader:    (p) => <Icon {...p}><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></Icon>,
  Tag:       (p) => <Icon {...p}><path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></Icon>,
  Search:    (p) => <Icon {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Icon>,
  ChevL:     (p) => <Icon {...p}><polyline points="15 18 9 12 15 6"/></Icon>,
  ChevR:     (p) => <Icon {...p}><polyline points="9 18 15 12 9 6"/></Icon>,
  ChevD:     (p) => <Icon {...p}><polyline points="6 9 12 15 18 9"/></Icon>,
  X:         (p) => <Icon {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Icon>,
  Plus:      (p) => <Icon {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Icon>,
  Trash:     (p) => <Icon {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></Icon>,
  Eye:       (p) => <Icon {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></Icon>,
  EyeOff:    (p) => <Icon {...p}><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="m1 1 22 22"/></Icon>,
  File:      (p) => <Icon {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></Icon>,
  Zap:       (p) => <Icon {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Icon>,
  Info:      (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></Icon>,
  Play:      (p) => <Icon {...p}><polygon points="5 3 19 12 5 21 5 3"/></Icon>,
  GripV:     (p) => <Icon {...p}><circle cx="9" cy="6" r=".7" fill="currentColor"/><circle cx="9" cy="12" r=".7" fill="currentColor"/><circle cx="9" cy="18" r=".7" fill="currentColor"/><circle cx="15" cy="6" r=".7" fill="currentColor"/><circle cx="15" cy="12" r=".7" fill="currentColor"/><circle cx="15" cy="18" r=".7" fill="currentColor"/></Icon>,
  Diamond:   (p) => <Icon {...p}><path d="M12 2 22 12 12 22 2 12z"/></Icon>,
  Globe:     (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></Icon>,
  ArrowR:    (p) => <Icon {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></Icon>,
  Archive:   (p) => <Icon {...p}><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></Icon>,
  Filter:    (p) => <Icon {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></Icon>,
  KB:        (p) => <Icon {...p}><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12"/></Icon>,
  Lock:      (p) => <Icon {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Icon>,
  Bookmark:  (p) => <Icon {...p}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></Icon>,
  Comment:   (p) => <Icon {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></Icon>,
  Columns:   (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></Icon>,
  Globe:     (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></Icon>,
};

// ─────────────────────────────────────────────────────────────
// Sidebar — shared across Dashboard, Project, Wizard, Settings
// ─────────────────────────────────────────────────────────────
function Sidebar({ active = 'dashboard', userName = 'Ammar Shaikh' }) {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: I.Dashboard },
    { id: 'tm',        label: 'TM Library', icon: I.Database },
    { id: 'glossary',  label: 'Glossary',   icon: I.Book },
  ];
  const NavRow = ({ it }) => {
    const isActive = it.id === active;
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, height: 40, padding: '0 12px',
        marginLeft: isActive ? 0 : 0,
        borderLeft: isActive ? `3px solid ${OC.teal500}` : '3px solid transparent',
        background: isActive ? OC.teal100 : 'transparent',
        color: isActive ? OC.teal700 : OC.stone700,
        fontWeight: isActive ? 600 : 500,
        fontSize: 14, borderRadius: isActive ? '0 6px 6px 0' : 6,
        cursor: 'pointer',
      }}>
        <it.icon size={18} color={isActive ? OC.teal600 : OC.stone500} />
        <span>{it.label}</span>
      </div>
    );
  };
  return (
    <aside style={{ width: 240, background: OC.stone100, borderRight: `1px solid ${OC.stone200}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', borderBottom: `1px solid ${OC.stone200}`, background: OC.white }}>
        <div style={{ width: 26, height: 26, borderRadius: 6, background: `linear-gradient(135deg, ${OC.teal500}, ${OC.teal600})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <I.Diamond size={14} color={OC.white} stroke={2.2} />
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: OC.stone900, letterSpacing: -0.2 }}>OpenCAT</span>
      </div>
      <nav style={{ padding: '12px 0 12px 0', display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {items.map((it) => <NavRow key={it.id} it={it} />)}
        <div style={{ height: 1, background: OC.stone200, margin: '12px 12px' }}/>
        <NavRow it={{ id: 'settings', label: 'Settings', icon: I.Settings }} />
      </nav>
      <div style={{ height: 56, borderTop: `1px solid ${OC.stone200}`, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: OC.stone300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: OC.stone700, fontWeight: 600, fontSize: 12 }}>
          {userName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
        </div>
        <span style={{ fontSize: 13, color: OC.stone700, fontWeight: 500 }}>{userName}</span>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────
// Buttons & badges
// ─────────────────────────────────────────────────────────────
function Btn({ children, variant = 'primary', size = 'md', icon: IcL, iconR: IcR, disabled, style, ...rest }) {
  const sizes = {
    sm: { h: 28, px: 10, fs: 12.5, gap: 6 },
    md: { h: 36, px: 14, fs: 14,   gap: 8 },
    lg: { h: 40, px: 16, fs: 14,   gap: 8 },
  }[size];
  const variants = {
    primary:     { bg: OC.teal500, fg: OC.white,    bd: 'transparent' },
    secondary:   { bg: OC.white,   fg: OC.stone700, bd: OC.stone300 },
    ghost:       { bg: 'transparent', fg: OC.stone700, bd: 'transparent' },
    destructive: { bg: OC.red600,  fg: OC.white,    bd: 'transparent' },
    teal_ghost:  { bg: 'transparent', fg: OC.teal600, bd: 'transparent' },
  }[variant];
  return (
    <button
      disabled={disabled}
      style={{
        height: sizes.h, padding: `0 ${sizes.px}px`, fontSize: sizes.fs, fontWeight: 500, gap: sizes.gap,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: variants.bg, color: variants.fg,
        border: `1px solid ${variants.bd}`,
        borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, fontFamily: OC.font, whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {IcL ? <IcL size={size === 'sm' ? 14 : 16} /> : null}
      <span>{children}</span>
      {IcR ? <IcR size={size === 'sm' ? 14 : 16} /> : null}
    </button>
  );
}

function Badge({ children, tone = 'stone', style }) {
  const tones = {
    stone:    { bg: OC.stone100,    fg: OC.stone500 },
    teal:     { bg: OC.teal50,      fg: OC.teal700 },
    teal100:  { bg: OC.teal100,     fg: OC.teal700 },
    green:    { bg: OC.green100,    fg: OC.green700 },
    emerald:  { bg: OC.emerald100,  fg: OC.emerald700 },
    amber:    { bg: OC.amber100,    fg: OC.amber700 },
    red:      { bg: OC.red100,      fg: OC.red700 },
    violet:   { bg: OC.violet100,   fg: OC.violet700 },
    sky:      { bg: OC.sky50,       fg: OC.sky700 },
  }[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: tones.bg, color: tones.fg, fontSize: 11.5, fontWeight: 600,
      padding: '3px 10px', borderRadius: 999, lineHeight: 1.2, whiteSpace: 'nowrap',
      ...style,
    }}>{children}</span>
  );
}

// Dot for segment status
function Dot({ status, size = 12 }) {
  const map = {
    untranslated: { bg: 'transparent', bd: OC.stone300 },
    draft:        { bg: OC.amber400,   bd: OC.amber400 },
    translated:   { bg: OC.green500,   bd: OC.green500 },
    reviewed:     { bg: OC.violet500,  bd: OC.violet500 },
    approved:     { bg: OC.green700,   bd: OC.green700, check: true },
    rejected:     { bg: OC.red500,     bd: OC.red500 },
    qa:           { bg: OC.red500,     bd: OC.red500 },
  };
  const it = map[status] || map.untranslated;
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%',
      background: it.bg, border: `2px solid ${it.bd}`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {it.check ? <I.CheckSm size={size - 5} color={OC.white} stroke={3} /> : null}
    </span>
  );
}

// Simple input/label/select using inline styles
function Field({ label, required, children, hint, error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label ? (
        <label style={{ fontSize: 13, fontWeight: 500, color: OC.stone700 }}>
          {label} {required ? <span style={{ color: OC.red500 }}>*</span> : null}
        </label>
      ) : null}
      {children}
      {hint && !error ? <div style={{ fontSize: 12, color: OC.stone400 }}>{hint}</div> : null}
      {error ? <div style={{ fontSize: 12, color: OC.red500 }}>{error}</div> : null}
    </div>
  );
}

function Input({ value, placeholder, focused, type = 'text', style, onChange }) {
  return (
    <input
      type={type}
      defaultValue={value}
      placeholder={placeholder}
      onChange={onChange}
      style={{
        height: 36, padding: '0 12px', fontSize: 14, color: OC.stone900,
        background: OC.white, border: `1px solid ${focused ? OC.teal500 : OC.stone300}`,
        borderRadius: 6, outline: 'none', fontFamily: OC.font,
        boxShadow: focused ? `0 0 0 3px ${OC.teal100}` : 'none',
        width: '100%', boxSizing: 'border-box',
        ...style,
      }}
    />
  );
}

function Select({ value, style }) {
  return (
    <div style={{
      height: 36, padding: '0 12px', fontSize: 14, color: OC.stone900,
      background: OC.white, border: `1px solid ${OC.stone300}`,
      borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      width: '100%', boxSizing: 'border-box', ...style,
    }}>
      <span>{value}</span>
      <I.ChevD size={16} color={OC.stone500} />
    </div>
  );
}

function Switch({ on }) {
  return (
    <div style={{
      width: 38, height: 22, borderRadius: 999, background: on ? OC.teal500 : OC.stone300,
      position: 'relative', flexShrink: 0, transition: 'background 0.15s',
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: OC.white,
        position: 'absolute', top: 2, left: on ? 18 : 2, transition: 'left 0.15s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }}/>
    </div>
  );
}

function Checkbox({ checked, disabled }) {
  return (
    <span style={{
      width: 18, height: 18, borderRadius: 4,
      background: checked ? OC.teal500 : OC.white,
      border: `1.5px solid ${checked ? OC.teal500 : OC.stone300}`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, opacity: disabled ? 0.6 : 1,
    }}>
      {checked ? <I.CheckSm size={12} color={OC.white} stroke={3} /> : null}
    </span>
  );
}

// Progress bar
function Progress({ value, width = '100%', height = 6, complete }) {
  const fill = complete || value >= 100 ? OC.green500 : OC.teal500;
  return (
    <div style={{ width, height, background: OC.stone200, borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: `${value}%`, height: '100%', background: fill, transition: 'width 0.3s' }}/>
    </div>
  );
}

// Tag chip used inside source/target text
function TagChip({ children, kind = 'open', selected }) {
  // open / close share teal styling; self-closing uses violet
  const isViolet = kind === 'self';
  const base = isViolet
    ? { bg: OC.violet100, fg: OC.violet700, bd: OC.violet200 }
    : { bg: OC.teal100,   fg: OC.teal700,   bd: OC.teal300 };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', height: 18,
      padding: '0 6px', margin: '0 1px',
      background: selected ? OC.teal200 : base.bg,
      color: base.fg,
      border: `1px solid ${selected ? OC.teal400 : base.bd}`,
      borderRadius: 4, fontSize: 11, fontFamily: OC.mono, fontWeight: 500,
      verticalAlign: 'baseline', cursor: 'default', userSelect: 'none',
      direction: 'ltr',
    }}>{children}</span>
  );
}

// Key badge for keyboard shortcuts
function KeyBadge({ children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 6px',
      background: OC.stone100, color: OC.stone700, border: `1px solid ${OC.stone200}`,
      borderRadius: 4, fontSize: 11, fontFamily: OC.mono, fontWeight: 500,
    }}>{children}</span>
  );
}

Object.assign(window, { OC, I, Icon, Sidebar, Btn, Badge, Dot, Field, Input, Select, Switch, Checkbox, Progress, TagChip, KeyBadge });
