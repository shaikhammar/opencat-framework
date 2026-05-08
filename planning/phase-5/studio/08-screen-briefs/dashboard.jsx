// Dashboard + Project Overview screens (AppLayout)

function Dashboard({ variant = 'projects' }) {
  // variant: 'projects' | 'empty' | 'project-overview'
  if (variant === 'project-overview') return <ProjectOverview />;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: OC.stone50, fontFamily: OC.font, overflow: 'hidden' }}>
      <Sidebar active="dashboard" />
      <main style={{ flex: 1, overflow: 'auto', padding: '32px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 600, color: OC.stone900, margin: 0, lineHeight: '32px' }}>My Projects</h1>
              <p style={{ fontSize: 13.5, color: OC.stone500, margin: '4px 0 0' }}>
                {variant === 'empty' ? 'Get started by creating your first project.' : '3 active · 1 archived · last activity 2h ago'}
              </p>
            </div>
            {variant !== 'empty' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn variant="secondary" size="md" icon={I.Filter}>Filter</Btn>
                <Btn variant="primary" size="md" icon={I.Plus}>New project</Btn>
              </div>
            )}
          </div>

          {variant === 'empty' ? <EmptyState /> : <ProjectGrid />}
        </div>
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      background: OC.white, border: `1px dashed ${OC.stone300}`, borderRadius: 12,
      padding: '80px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: 24,
    }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: OC.stone100, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <I.Folder size={28} color={OC.stone400} />
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: OC.stone900, margin: 0 }}>No projects yet</h2>
      <p style={{ fontSize: 14, color: OC.stone500, margin: '8px 0 24px', maxWidth: 320, lineHeight: '20px' }}>
        Create your first project to start translating. You can import DOCX, PPTX, XLIFF and more.
      </p>
      <Btn variant="primary" size="md" icon={I.Plus} iconR={I.ArrowR}>Create project</Btn>
      <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${OC.stone100}`, fontSize: 12, color: OC.stone400, display: 'flex', gap: 16 }}>
        <span>📘 Read docs</span>
        <span>·</span>
        <span>⌨ Keyboard shortcuts</span>
      </div>
    </div>
  );
}

function ProjectGrid() {
  const projects = [
    {
      name: 'Legal Contract Translation', src: 'EN', tgt: 'UR', status: 'active',
      done: 1904, total: 4231, files: 3, last: '2 hours ago',
      next: { kind: 'translate', label: 'Ready to translate' },
    },
    {
      name: 'Marketing Brochure Q4', src: 'EN', tgt: 'AR', status: 'processing',
      done: 0, total: 8420, files: 4, last: '5 minutes ago',
      next: { kind: 'processing', label: 'Processing files…' },
    },
    {
      name: 'User Manual v2 (Hindi)', src: 'EN', tgt: 'HI', status: 'active',
      done: 12_650, total: 12_650, files: 7, last: 'Yesterday',
      next: { kind: 'export', label: 'Translation complete — export?' },
    },
    {
      name: 'Annual Report 2025', src: 'EN', tgt: 'DE', status: 'active',
      done: 3214, total: 5800, files: 2, last: '3 days ago',
      next: { kind: 'review', label: 'Ready for review · 8 segments' },
    },
    {
      name: 'Privacy Policy Update', src: 'EN', tgt: 'FR', status: 'active',
      done: 980, total: 980, files: 1, last: '1 week ago',
      next: { kind: 'qa', label: 'QA found 2 warnings' },
    },
    {
      name: 'Onboarding emails', src: 'EN', tgt: 'JA', status: 'archived',
      done: 4520, total: 4520, files: 5, last: 'Mar 14, 2026',
      next: null,
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 0 }}>
      {projects.map((p, i) => <ProjectCard key={i} p={p} />)}
    </div>
  );
}

function ProjectCard({ p }) {
  const pct = Math.round((p.done / p.total) * 100);
  const isComplete = pct === 100;
  const archived = p.status === 'archived';

  const StatusBadge = () => {
    if (archived)        return <Badge tone="stone">Archived</Badge>;
    if (p.status === 'processing') return <Badge tone="amber"><I.Loader size={10} stroke={2.5} style={{ animation: 'oc-spin 1s linear infinite' }}/> Processing</Badge>;
    if (isComplete)      return <Badge tone="green"><I.CheckSm size={11} stroke={3}/> Complete</Badge>;
    return <Badge tone="green">● Active</Badge>;
  };

  const nextChip = p.next ? (
    <div style={{
      background: ({
        translate: OC.teal50,
        processing: OC.amber100,
        export: OC.green100,
        review: OC.violet100,
        qa: OC.red100,
      })[p.next.kind],
      color: ({
        translate: OC.teal700,
        processing: OC.amber700,
        export: OC.green700,
        review: OC.violet700,
        qa: OC.red700,
      })[p.next.kind],
      fontSize: 12, fontWeight: 500, padding: '8px 12px', borderRadius: 6,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14,
    }}>
      {p.next.kind === 'processing' && <I.Loader size={12} stroke={2.5} style={{ animation: 'oc-spin 1s linear infinite' }}/>}
      {p.next.kind === 'export' && <I.Download size={12}/>}
      {p.next.kind === 'qa' && <I.Warning size={12}/>}
      {p.next.kind === 'review' && <I.Pencil size={12}/>}
      <span>{p.next.label}</span>
      {p.next.kind !== 'processing' && <I.ChevR size={12}/>}
    </div>
  ) : null;

  return (
    <div style={{
      background: archived ? OC.stone50 : OC.white,
      border: `1px solid ${OC.stone200}`, borderRadius: 10, padding: 20,
      display: 'flex', flexDirection: 'column', minHeight: 220,
      opacity: archived ? 0.75 : 1,
    }}>
      <style>{`@keyframes oc-spin { 100% { transform: rotate(360deg); } }`}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Badge tone="teal">{p.src} → {p.tgt}</Badge>
        <StatusBadge />
      </div>

      <div style={{ fontSize: 16, fontWeight: 600, color: OC.stone900, marginBottom: 12, lineHeight: '22px' }}>
        {p.name}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <Progress value={pct} />
        <span style={{ fontSize: 13, fontWeight: 600, color: OC.stone700, minWidth: 36, textAlign: 'right' }}>{pct}%</span>
      </div>

      <div style={{ fontSize: 12, color: OC.stone500, fontVariantNumeric: 'tabular-nums' }}>
        {p.done.toLocaleString()} / {p.total.toLocaleString()} words
      </div>

      <div style={{ fontSize: 11.5, color: OC.stone400, marginTop: 8 }}>
        {p.files} {p.files === 1 ? 'file' : 'files'} · Last activity {p.last}
      </div>

      {nextChip}

      <div style={{ flex: 1 }}/>

      {!archived && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
          <button style={{ background: 'transparent', border: 'none', color: OC.teal600, fontSize: 13, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', padding: 0 }}>
            Open project <I.ArrowR size={14}/>
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Project Overview
// ─────────────────────────────────────────────────────────────
function ProjectOverview() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: OC.stone50, fontFamily: OC.font, overflow: 'hidden' }}>
      <Sidebar active="dashboard" />
      <main style={{ flex: 1, overflow: 'auto', padding: '32px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: 12.5, color: OC.stone400, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Dashboard</span>
            <I.ChevR size={12}/>
            <span style={{ color: OC.stone700 }}>Legal Contract Translation</span>
          </div>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 600, color: OC.stone900, margin: 0, lineHeight: '32px' }}>
                Legal Contract Translation
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: OC.stone500, marginTop: 6 }}>
                <span style={{ color: OC.teal600, fontWeight: 600 }}>EN → UR</span>
                <span>·</span>
                <span style={{ color: OC.green700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>● Active</span>
                <span>·</span>
                <span>Created Jan 12, 2026</span>
                <span>·</span>
                <span>Owner Ammar Shaikh</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="secondary" size="md" icon={I.Settings}>Project settings</Btn>
              <Btn variant="secondary" size="md" icon={I.Archive}>Archive</Btn>
            </div>
          </div>

          {/* Next-step banner */}
          <div style={{
            background: OC.teal50, border: `1px solid ${OC.teal200}`, borderRadius: 8,
            padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, color: OC.teal700, fontSize: 13.5, marginBottom: 28,
          }}>
            <I.Play size={14} fill={OC.teal600} color={OC.teal600}/>
            <strong style={{ fontWeight: 600 }}>Your files are ready.</strong>
            <span>Open <code style={{ fontFamily: OC.mono, fontSize: 12, background: OC.teal100, padding: '1px 6px', borderRadius: 3 }}>contract.docx</code> to continue translating, or upload another file.</span>
            <div style={{ flex: 1 }}/>
            <Btn variant="ghost" size="sm" style={{ color: OC.teal700 }}>Dismiss</Btn>
          </div>

          {/* Files section */}
          <SectionHeader title="Files" count={3} action={<Btn variant="primary" size="sm" icon={I.Upload}>Upload file</Btn>} />
          <FileTable />

          {/* Resources grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 32 }}>
            <ResourceCard
              icon={I.Database}
              title="Translation Memory"
              subtitle="Project TM (EN → UR)"
              meta="1,204 entries · Updated 2h ago"
              actions={[
                { label: 'Search TM', icon: I.Search },
                { label: 'Import TMX' },
                { label: 'Export TMX' },
              ]}
            />
            <ResourceCard
              icon={I.Book}
              title="Glossary"
              subtitle="Project Glossary (EN → UR)"
              meta="342 terms"
              actions={[
                { label: 'Import TBX' },
                { label: 'Export TBX' },
                { label: 'Add term', icon: I.Plus, primary: true },
              ]}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function SectionHeader({ title, count, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: OC.stone900, margin: 0, display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
        {title} <span style={{ fontSize: 13, color: OC.stone400, fontWeight: 500 }}>({count})</span>
      </h2>
      {action}
    </div>
  );
}

function FileTable() {
  const files = [
    { name: 'contract.docx',           fmt: 'DOCX', words: 4231, done: 1904, status: 'ready' },
    { name: 'amendment-A.docx',        fmt: 'DOCX', words: 1280, done: 1280, status: 'translated' },
    { name: 'slides.pptx',             fmt: 'PPTX', words: 892,  done: 0,    status: 'ready' },
    { name: 'fee-schedule.xlsx',       fmt: 'XLSX', words: null, done: 0,    status: 'processing' },
  ];

  return (
    <div style={{ background: OC.white, border: `1px solid ${OC.stone200}`, borderRadius: 8, overflow: 'hidden' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '2.4fr 1fr 1fr 1.6fr 1.2fr 1.2fr',
        background: OC.stone50, borderBottom: `1px solid ${OC.stone200}`,
        fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: OC.stone500,
        padding: '10px 16px',
      }}>
        <div>File</div><div>Format</div><div>Words</div><div>Progress</div><div>Status</div><div style={{ textAlign: 'right' }}>Actions</div>
      </div>
      {files.map((f, i) => {
        const pct = f.words ? Math.round((f.done / f.words) * 100) : 0;
        const isProc = f.status === 'processing';
        return (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '2.4fr 1fr 1fr 1.6fr 1.2fr 1.2fr',
            padding: '12px 16px', alignItems: 'center', borderBottom: i === files.length - 1 ? 'none' : `1px solid ${OC.stone100}`,
            fontSize: 13,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: OC.stone900, fontWeight: 500 }}>
              <I.File size={16} color={OC.stone400}/>
              {f.name}
            </div>
            <div><Badge tone="teal">{f.fmt}</Badge></div>
            <div style={{ color: OC.stone700, fontVariantNumeric: 'tabular-nums' }}>
              {f.words ? f.words.toLocaleString() : '—'}
            </div>
            <div>
              {isProc ? (
                <span style={{ color: OC.amber600, fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <I.Loader size={12} stroke={2.5} style={{ animation: 'oc-spin 1s linear infinite' }}/> Extracting segments…
                </span>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Progress value={pct} width={120} height={4}/>
                  <span style={{ fontSize: 12, color: OC.stone500, minWidth: 32 }}>{pct}%</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {isProc ? (
                <Badge tone="amber">Processing</Badge>
              ) : f.done === f.words ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: OC.green700, fontSize: 12.5 }}>
                  <Dot status="approved" size={10}/> Translated
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: OC.stone700, fontSize: 12.5 }}>
                  <Dot status="translated" size={10}/> Ready
                </span>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
              {!isProc && <Btn variant="primary" size="sm">Translate</Btn>}
              {!isProc && f.done === f.words && <Btn variant="secondary" size="sm" icon={I.Download}>Export</Btn>}
              {isProc && <span style={{ color: OC.stone400 }}>—</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ResourceCard({ icon: Ic, title, subtitle, meta, actions }) {
  return (
    <div style={{ background: OC.white, border: `1px solid ${OC.stone200}`, borderRadius: 8, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: OC.teal50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Ic size={16} color={OC.teal600}/>
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: OC.stone900, margin: 0 }}>{title}</h3>
      </div>
      <div style={{ fontSize: 13, color: OC.stone700, fontWeight: 500 }}>{subtitle}</div>
      <div style={{ fontSize: 11.5, color: OC.stone500, marginTop: 4 }}>{meta}</div>
      <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
        {actions.map((a, i) => (
          <Btn key={i} variant={a.primary ? 'primary' : 'secondary'} size="sm" icon={a.icon}>{a.label}</Btn>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });
