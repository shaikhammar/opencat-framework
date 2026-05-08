// Translation Editor — most complex screen.
// Renders the LTR→RTL primary view; takes props for variants (RTL→LTR, QA panel).

function Editor({ variant = 'ltr-rtl' }) {
  // variant: 'ltr-rtl' | 'rtl-ltr' | 'qa-panel'
  const isRtlLtr = variant === 'rtl-ltr';
  const isQa = variant === 'qa-panel';

  // charLimit comes from project wizard's "Character limit per segment" field.
  // null/undefined ⇒ no limit (no color coding).
  const project = isRtlLtr
    ? { fileName: 'interview-2024.docx', src: 'AR', tgt: 'EN', name: 'Back-translation Project', srcDir: 'rtl', tgtDir: 'ltr', wordsDone: 612, wordsTotal: 1820, charLimit: 140 }
    : { fileName: 'contract.docx',       src: 'EN', tgt: 'UR', name: 'Legal Contract Translation', srcDir: 'ltr', tgtDir: 'rtl', wordsDone: 1904, wordsTotal: 4231, charLimit: 120 };

  const pct = Math.round((project.wordsDone / project.wordsTotal) * 100);

  // Segment data per variant
  const segs = isRtlLtr ? [
    { n: 1, status: 'translated', src: 'أجريت هذه المقابلة في يناير 2024 في مدينة الرياض.', tgt: 'This interview was conducted in January 2024 in the city of Riyadh.', tm: 100, confirmed: true },
    { n: 2, status: 'translated', src: 'كان المحاور صحفياً مستقلاً يعمل في مجال حقوق الإنسان.', tgt: 'The interviewer was an independent journalist working in human rights.', tm: 95, confirmed: true, comments: 1 },
    { n: 3, status: 'untranslated', src: 'وأشار إلى أن الوضع الاقتصادي قد تحسن بشكل ملحوظ خلال العامين الماضيين.', tgt: '', tm: null, selected: true, bookmarked: true },
    { n: 4, status: 'draft',       src: 'وأضاف أن السياسات الجديدة قد ساهمت في خلق فرص عمل جديدة.', tgt: 'He added that the new policies have helped create new jobs.', tm: 88 },
    { n: 5, status: 'untranslated', src: 'وقال إن التعليم يبقى أولوية قصوى.', tgt: '', tm: null, locked: true },
    { n: 6, status: 'untranslated', src: 'هل ترى انعكاسات إيجابية في القطاع الخاص؟', tgt: '', tm: null },
  ] : [
    { n: 1, status: 'translated', src: <>This Agreement is entered into as of the 12<sup>th</sup> day of January, 2026.</>, tgt: <>یہ معاہدہ 12 جنوری 2026 کو طے پایا ہے۔</>, tm: 100, confirmed: true },
    { n: 2, status: 'untranslated', src: <>The parties agree to the terms set forth in <TagChip kind="open">{'{1}'}</TagChip>Schedule&nbsp;A<TagChip kind="close">{'{/1}'}</TagChip> and shall be bound by them.</>, tgt: '', tm: 95, selected: true, comments: 1 },
    { n: 3, status: 'translated', src: <>Payment shall be due within thirty (30) calendar days of invoice receipt.</>, tgt: <>ادائیگی انوائس موصول ہونے کے تیس (30) کیلنڈر دنوں کے اندر واجب الادا ہوگی۔</>, tm: 100, confirmed: true },
    { n: 4, status: 'qa', src: <>See clause <TagChip kind="open">{'{1}'}</TagChip>3.2<TagChip kind="close">{'{/1}'}</TagChip> for the full schedule of fees and payment milestones.</>, tgt: <>مکمل فیس اور ادائیگی کے سنگ میل کے لیے شق <TagChip kind="open">{'{1}'}</TagChip>3.2 دیکھیں۔</>, tm: 82, qaWarn: true, comments: 2 },
    { n: 5, status: 'reviewed', src: <>Either party may terminate this Agreement upon written notice.<TagChip kind="self">{'{2/}'}</TagChip></>, tgt: <>کوئی بھی فریق تحریری نوٹس پر یہ معاہدہ ختم کر سکتا ہے۔<TagChip kind="self">{'{2/}'}</TagChip></>, tm: 100, confirmed: true, bookmarked: true },
    { n: 6, status: 'approved', src: <>Confidentiality obligations shall survive termination.</>, tgt: <>رازداری کی ذمہ داریاں ختم ہونے کے بعد بھی برقرار رہیں گی۔</>, tm: 100, confirmed: true, locked: true },
    { n: 7, status: 'draft', src: <>Notices shall be delivered by certified mail or courier service.</>, tgt: <>اطلاعات سرٹیفائیڈ میل یا کوریئر سروس کے ذریعے پہنچائی جائیں گی۔</>, tm: 75 },
    { n: 8, status: 'untranslated', src: <>This Agreement constitutes the entire understanding between the parties.</>, tgt: '', tm: null },
    { n: 9, status: 'untranslated', src: <>No amendment shall be effective unless made in writing and signed.</>, tgt: '', tm: null },
    { n: 10, status: 'untranslated', src: <>Governing law shall be that of the State of Delaware.</>, tgt: '', tm: null },
  ];

  // Approximate plain-text length of a node tree (handles strings + JSX)
  const textLen = (node) => {
    if (node == null || node === false) return 0;
    if (typeof node === 'string' || typeof node === 'number') return String(node).length;
    if (Array.isArray(node)) return node.reduce((a, n) => a + textLen(n), 0);
    if (node.props) {
      // <TagChip>{1}</TagChip> renders 3-ish chars visually; count children
      return textLen(node.props.children);
    }
    return 0;
  };

  // limit-aware color tokens
  const charTone = (count, limit) => {
    if (!limit || count === 0) return { fg: OC.stone400, bg: 'transparent', label: 'ok' };
    const ratio = count / limit;
    if (ratio > 1)    return { fg: OC.red700,    bg: OC.red100,    label: 'over'   };
    if (ratio >= 0.9) return { fg: OC.amber700,  bg: OC.amber100,  label: 'near'   };
    return                  { fg: OC.green700,   bg: OC.green100,  label: 'under'  };
  };

  const Row = ({ s, i }) => {
    const selected = s.selected;
    const bg = selected ? OC.teal50 : (i % 2 === 1 ? OC.stone50 : OC.white);
    const targetEmpty = !s.tgt || (typeof s.tgt === 'string' && s.tgt.trim() === '');
    const srcChars = textLen(s.src);
    const tgtChars = targetEmpty ? 0 : textLen(s.tgt);
    const tone = charTone(tgtChars, project.charLimit);
    return (
      <div style={{
        display: 'grid', gridTemplateColumns: '36px 48px 1fr 1fr 60px 72px 96px',
        background: bg,
        borderBottom: `1px solid ${OC.stone100}`,
        borderLeft: selected ? `3px solid ${OC.teal500}` : '3px solid transparent',
        minHeight: 48, alignItems: 'stretch',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Dot status={s.status} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8, color: OC.stone400, fontSize: 11.5, fontVariantNumeric: 'tabular-nums' }}>
          {String(s.n).padStart(3, '0')}
        </div>
        <div dir={project.srcDir} style={{
          padding: '10px 14px', fontSize: 14, lineHeight: '22px', color: OC.stone800,
          textAlign: project.srcDir === 'rtl' ? 'right' : 'left',
          borderRight: `1px solid ${OC.stone100}`,
        }}>
          {s.src}
        </div>
        <div dir={project.tgtDir} style={{
          padding: '10px 14px', fontSize: 14, lineHeight: '22px', color: OC.stone900,
          textAlign: project.tgtDir === 'rtl' ? 'right' : 'left',
          borderRight: `1px solid ${OC.stone100}`,
          position: 'relative',
          background: selected ? OC.white : 'transparent',
          boxShadow: selected ? `inset 0 0 0 2px ${OC.teal500}` : 'none',
        }}>
          {targetEmpty ? (
            <span style={{ color: OC.stone400 }}>
              {selected ? (
                <>
                  <span style={{ display: 'inline-block', width: 1, height: 16, background: OC.teal600, verticalAlign: 'middle', animation: 'oc-blink 1s steps(1) infinite' }}/>
                  <span style={{ marginLeft: 6 }}>Type translation…</span>
                </>
              ) : 'Type translation…'}
            </span>
          ) : s.tgt}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 12,
          fontSize: 11.5, fontWeight: 600,
          color: s.tm == null ? 'transparent' :
                 s.tm === 100 ? OC.green600 :
                 s.tm >= 95 ? OC.emerald600 :
                 s.tm >= 75 ? OC.amber600 : OC.stone400,
        }}>
          {s.tm != null ? `${s.tm}%` : ''}
        </div>
        {/* Char count column — colored by tgt vs project.charLimit */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 10,
          fontSize: 11, fontWeight: 600, fontFamily: OC.mono, fontVariantNumeric: 'tabular-nums',
        }}>
          {targetEmpty ? (
            <span style={{ color: OC.stone300 }}>—</span>
          ) : (
            <span style={{
              padding: '2px 6px', borderRadius: 4,
              background: tone.bg, color: tone.fg,
              border: tone.label === 'over' ? `1px solid ${OC.red400}` : 'none',
            }} title={`${tgtChars} / ${project.charLimit} chars`}>
              {tgtChars}{project.charLimit ? `/${project.charLimit}` : ''}
            </span>
          )}
        </div>
        {/* Per-row actions */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2,
          paddingRight: 10, color: OC.stone400,
        }}>
          <RowAction icon={I.CheckSm} active={s.confirmed} activeColor={OC.green600} title="Confirm"/>
          <RowAction icon={I.Lock} active={s.locked} activeColor={OC.stone700} title="Lock"/>
          <RowAction icon={I.Bookmark} active={s.bookmarked} activeColor={OC.amber600} title="Bookmark"/>
          <RowAction icon={I.Comment} active={s.comments > 0} activeColor={OC.teal600} count={s.comments} title="Comments"/>
        </div>
      </div>
    );
  };

  // ── Side panel content
  const tabs = [
    { id: 'tm', label: 'TM', count: 2 },
    { id: 'mt', label: 'MT', count: 1 },
    { id: 'qa', label: 'QA', count: isQa ? 3 : 1 },
    { id: 'gloss', label: 'Glossary', count: 2 },
  ];
  const activeTab = isQa ? 'qa' : 'tm';

  const SidePanel = () => (
    <aside style={{ width: 380, background: OC.stone50, borderLeft: `1px solid ${OC.stone200}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', height: 40, borderBottom: `1px solid ${OC.stone200}`, background: OC.white, paddingLeft: 8 }}>
        {tabs.map((t) => {
          const active = t.id === activeTab;
          return (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px',
              fontSize: 13, fontWeight: 500,
              color: active ? OC.teal600 : OC.stone500,
              borderBottom: active ? `2px solid ${OC.teal500}` : '2px solid transparent',
              cursor: 'pointer',
            }}>
              {t.label}
              <span style={{ fontSize: 11, color: active ? OC.teal600 : OC.stone400, fontWeight: 500 }}>{t.count}</span>
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'tm' && !isRtlLtr && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: OC.stone400, padding: '14px 16px 8px' }}>
              TM Matches for Segment 002
            </div>
            <MatchCard pct={95} name="Project TM (EN→UR)" srcDiff={[
              { t: 'The parties agree to the terms set forth in ', diff: false },
              { t: 'Schedule A', diff: false, tag: 'open' },
              { t: ' and ', diff: false },
              { t: 'will be bound', diff: true },
              { t: ' by them.', diff: false },
            ]} tgt="فریقین شیڈول A میں طے شدہ شرائط پر متفق ہیں اور ان کے پابند رہیں گے۔" tgtRtl />
            <MatchCard pct={82} name="Global TM" srcDiff={[
              { t: 'Both parties accept ', diff: true },
              { t: 'the terms set forth in ', diff: false },
              { t: 'Annex A', diff: true, tag: 'open' },
              { t: '.', diff: false },
            ]} tgt="دونوں فریق ضمیمہ A میں درج شرائط قبول کرتے ہیں۔" tgtRtl />
          </>
        )}
        {activeTab === 'tm' && isRtlLtr && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: OC.stone400, padding: '14px 16px 8px' }}>
              TM Matches for Segment 003
            </div>
            <MatchCard pct={88} name="Project TM (AR→EN)"
              srcDiff={[{ t: 'وأشار إلى أن الوضع الاقتصادي قد تحسن خلال العام الماضي.', diff: false }]}
              srcRtl
              tgt="He noted that the economic situation has improved over the past year." />
            <MatchCard pct={76} name="Global TM"
              srcDiff={[{ t: 'الوضع الاقتصادي تحسن بشكل ملحوظ.', diff: false }]}
              srcRtl
              tgt="The economic situation has improved noticeably." />
          </>
        )}

        {activeTab === 'qa' && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: OC.stone400, padding: '14px 16px 8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>QA Issues</span>
              <span style={{ color: OC.red600 }}>3 errors</span>
            </div>
            <QaRow tone="red" title="Missing closing tag {/1}"   sub="Segment 004 · Tag consistency" />
            <QaRow tone="amber" title="Length ratio 1.8× (max 2.5×)" sub="Segment 012 · Length ratio" />
            <QaRow tone="amber" title="Trailing whitespace in target" sub="Segment 047 · Whitespace" />
            <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, color: OC.green600, fontSize: 12.5 }}>
              <I.Check size={14} color={OC.green600}/>
              <span>No issues in current segment.</span>
            </div>
            <div style={{ height: 1, background: OC.stone200, margin: '12px 16px' }}/>
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Btn size="sm" variant="secondary" icon={I.Play} style={{ width: '100%', justifyContent: 'flex-start' }}>Re-run all QA checks</Btn>
            </div>
          </>
        )}
      </div>
    </aside>
  );

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: OC.white, fontFamily: OC.font, overflow: 'hidden' }}>
      <style>{`@keyframes oc-blink { 50% { opacity: 0; } }`}</style>

      {/* Top bar */}
      <header style={{ height: 56, background: OC.white, borderBottom: `1px solid ${OC.stone200}`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: OC.stone500, cursor: 'pointer', fontSize: 13 }}>
          <I.ChevL size={16} />
          <span>{project.name}</span>
        </div>
        <div style={{ color: OC.stone300 }}>·</div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: OC.stone900 }}>{project.fileName}</div>
        <Badge tone="teal">{project.src} → {project.tgt}</Badge>

        <div style={{ flex: 1 }}/>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12.5, color: OC.stone700, fontVariantNumeric: 'tabular-nums' }}>
            {project.wordsDone.toLocaleString()} / {project.wordsTotal.toLocaleString()} words
          </span>
          <div style={{ width: 120 }}><Progress value={pct} /></div>
          <span style={{ fontSize: 12.5, color: OC.stone700, fontWeight: 600, minWidth: 32, textAlign: 'right' }}>{pct}%</span>
        </div>

        <div style={{ width: 1, height: 24, background: OC.stone200, margin: '0 4px' }}/>

        {/* Linked resources */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: OC.stone500 }}>
          <span title="Translation Memory linked" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', background: OC.teal50, color: OC.teal700, border: `1px solid ${OC.teal200}`, borderRadius: 4, fontWeight: 600 }}>
            <I.Database size={10} color={OC.teal700}/> TM
          </span>
          <span title="Term Base linked" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', background: OC.violet100, color: OC.violet700, border: `1px solid ${OC.violet200}`, borderRadius: 4, fontWeight: 600 }}>
            <I.Book size={10} color={OC.violet700}/> TB
          </span>
          <span title="Machine Translation enabled" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', background: OC.sky50, color: OC.sky700, border: `1px solid ${OC.sky200}`, borderRadius: 4, fontWeight: 600 }}>
            <I.Globe size={10} color={OC.sky700}/> MT
          </span>
        </div>

        <div style={{ width: 1, height: 24, background: OC.stone200, margin: '0 4px' }}/>

        <Btn variant="secondary" size="sm" icon={I.Shield}>
          QA <span style={{ background: OC.amber100, color: OC.amber700, padding: '1px 6px', borderRadius: 999, fontSize: 11, fontWeight: 600, marginLeft: 4 }}>3</span>
        </Btn>
        <Btn variant="secondary" size="sm" icon={I.Download} iconR={I.ChevD}>Export</Btn>
      </header>

      {/* Body: segment table + side panel */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Segment table */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          {/* Filter bar */}
          <div style={{
            display: 'grid', gridTemplateColumns: '36px 1fr 1fr 70px 72px',
            background: OC.white, borderBottom: `1px solid ${OC.stone200}`,
            height: 44, alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <I.Filter size={14} color={OC.stone500}/>
            </div>
            <div style={{ padding: '0 8px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, height: 28,
                background: OC.stone50, border: `1px solid ${OC.stone200}`, borderRadius: 6, padding: '0 10px',
              }}>
                <I.Search size={13} color={OC.stone400}/>
                <span style={{ fontSize: 12.5, color: OC.stone400 }}>Filter source ({project.src.toLowerCase()})…</span>
              </div>
            </div>
            <div style={{ padding: '0 8px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, height: 28,
                background: OC.stone50, border: `1px solid ${OC.stone200}`, borderRadius: 6, padding: '0 10px',
              }}>
                <I.Search size={13} color={OC.stone400}/>
                <span style={{ fontSize: 12.5, color: OC.stone400 }}>Filter target ({project.tgt.toLowerCase()})…</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8, gap: 8 }}>
              <button title="Toggle columns" style={{
                width: 26, height: 26, padding: 0,
                background: 'transparent', border: `1px solid ${OC.stone200}`, borderRadius: 6,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: OC.stone500,
              }}>
                <I.Columns size={13} color={OC.stone500}/>
              </button>
              <button style={{ background: 'transparent', border: 'none', color: OC.teal600, fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>Clear</button>
            </div>
            <div/>
          </div>

          {/* Active filter chips row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            background: OC.stone50, borderBottom: `1px solid ${OC.stone200}`, flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: OC.stone500, marginRight: 4 }}>Status</span>
            <FilterChip active label="All" count={312}/>
            <FilterChip label="Untranslated" count={184} dot={<Dot status="untranslated" size={8}/>}/>
            <FilterChip label="Draft" count={42} dot={<Dot status="draft" size={8}/>}/>
            <FilterChip label="Translated" count={68} dot={<Dot status="translated" size={8}/>}/>
            <FilterChip label="Reviewed" count={12} dot={<Dot status="reviewed" size={8}/>}/>
            <FilterChip label="Approved" count={4} dot={<Dot status="approved" size={8}/>}/>
            <FilterChip label="Rejected" count={2} dot={<Dot status="rejected" size={8}/>}/>
            <span style={{ width: 1, height: 16, background: OC.stone200, margin: '0 4px' }}/>
            <FilterChip label="Confirmed" icon={I.CheckSm}/>
            <FilterChip label="Unconfirmed" icon={I.Pencil}/>
            <FilterChip label="Locked"/>
            <FilterChip label="QA flagged" count={3} icon={I.Warning} tone="red"/>
            <FilterChip label="Has TM match" icon={I.Database}/>
            <FilterChip label="Over char limit" tone="red"/>
            <div style={{ flex: 1 }}/>
            <button style={{
              background: OC.white, border: `1px solid ${OC.stone200}`, borderRadius: 6,
              padding: '4px 10px', fontSize: 11.5, color: OC.stone600, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 500,
            }}>
              <I.Plus size={12}/> Add filter
            </button>
          </div>
          {/* table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '36px 48px 1fr 1fr 60px 72px 96px',
            background: OC.stone50, borderBottom: `1px solid ${OC.stone200}`, borderTop: `1px solid ${OC.stone200}`,
            fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: OC.stone500,
            height: 32, alignItems: 'center',
          }}>
            <div/>
            <div style={{ textAlign: 'right', paddingRight: 8 }}>#</div>
            <div style={{ padding: '0 14px' }}>Source · {project.src}</div>
            <div style={{ padding: '0 14px' }}>Target · {project.tgt}</div>
            <div style={{ textAlign: 'right', paddingRight: 12 }}>TM</div>
            <div style={{ textAlign: 'right', paddingRight: 10 }} title={`Limit ${project.charLimit} chars`}>Chars</div>
            <div style={{ textAlign: 'right', paddingRight: 10 }}>Actions</div>
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            {segs.map((s, i) => <Row key={s.n} s={s} i={i} />)}
          </div>
        </div>

        <SidePanel />
      </div>

      {/* Status bar */}
      <footer style={{ height: 32, background: OC.stone50, borderTop: `1px solid ${OC.stone200}`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 14, fontSize: 11.5, color: OC.stone500, flexShrink: 0 }}>
        <span>Seg <strong style={{ color: OC.stone700, fontWeight: 600 }}>{isRtlLtr ? '003' : '002'}</strong> / 312</span>
        <span>·</span>
        <span>45 words</span>
        <span>·</span>
        {/* Character count for the current segment, color-coded against project.charLimit */}
        {(() => {
          // Demo current-segment values per variant
          const cur = isRtlLtr ? 0 : 0;          // selected segment is empty in primary
          const limit = project.charLimit;
          const t = charTone(cur, limit);
          return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span>Chars</span>
              <span style={{
                fontFamily: OC.mono, fontWeight: 600, fontSize: 11,
                padding: '2px 7px', borderRadius: 4,
                background: t.bg === 'transparent' ? OC.stone100 : t.bg,
                color: t.fg === OC.stone400 ? OC.stone600 : t.fg,
              }}>
                {cur}{limit ? ` / ${limit}` : ''}
              </span>
              {limit && cur > 0 && (
                <span style={{ color: t.fg, fontWeight: 500 }}>
                  {t.label === 'over' ? `+${cur - limit} over` : t.label === 'near' ? `${limit - cur} left` : `${limit - cur} left`}
                </span>
              )}
            </span>
          );
        })()}
        <span>·</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <I.Check size={12} color={OC.green500}/> Auto-saved
        </span>
        <div style={{ flex: 1 }}/>
        {project.charLimit && (
          <>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: OC.green500 }}/>under
              <span style={{ width: 8, height: 8, borderRadius: 2, background: OC.amber400, marginLeft: 6 }}/>≥90%
              <span style={{ width: 8, height: 8, borderRadius: 2, background: OC.red500, marginLeft: 6 }}/>over {project.charLimit}
            </span>
            <span>·</span>
          </>
        )}
        <span>Press <KeyBadge>Ctrl</KeyBadge> <KeyBadge>?</KeyBadge> for shortcuts</span>
      </footer>
    </div>
  );
}

function MatchCard({ pct, name, srcDiff, tgt, srcRtl, tgtRtl }) {
  const tone = pct === 100 ? 'green' : pct >= 95 ? 'emerald' : pct >= 75 ? 'amber' : 'stone';
  return (
    <div style={{ background: OC.white, border: `1px solid ${OC.stone200}`, borderRadius: 8, padding: 12, margin: '0 12px 8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Badge tone={tone}>{pct}%</Badge>
          <span style={{ fontSize: 11, color: OC.stone400 }}>{name}</span>
        </div>
        <button style={{ background: 'transparent', border: 'none', color: OC.teal600, fontSize: 11.5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
          Insert <KeyBadge>↵</KeyBadge>
        </button>
      </div>
      <div dir={srcRtl ? 'rtl' : 'ltr'} style={{ fontSize: 13, lineHeight: '20px', color: OC.stone700, textAlign: srcRtl ? 'right' : 'left', marginBottom: 6 }}>
        {srcDiff.map((seg, i) => (
          seg.diff
            ? <span key={i} style={{ background: OC.amber100, color: OC.amber700, borderRadius: 3, padding: '0 2px' }}>{seg.t}</span>
            : seg.tag === 'open'
              ? <TagChip key={i} kind="open">{`{1} ${seg.t} {/1}`.trim()}</TagChip>
              : <span key={i}>{seg.t}</span>
        ))}
      </div>
      <div dir={tgtRtl ? 'rtl' : 'ltr'} style={{ fontSize: 13, lineHeight: '20px', color: OC.stone900, textAlign: tgtRtl ? 'right' : 'left' }}>
        {tgt}
      </div>
    </div>
  );
}

function QaRow({ tone, title, sub }) {
  const colors = tone === 'red'
    ? { border: OC.red500, icColor: OC.red600 }
    : { border: OC.amber400, icColor: OC.amber600 };
  const Ic = tone === 'red' ? I.Warning : I.Warning;
  return (
    <div style={{
      background: OC.white, borderLeft: `3px solid ${colors.border}`,
      borderTop: `1px solid ${OC.stone200}`, borderRight: `1px solid ${OC.stone200}`, borderBottom: `1px solid ${OC.stone200}`,
      borderRadius: 6, padding: '10px 12px', margin: '0 12px 8px', display: 'flex', gap: 10,
    }}>
      <Ic size={14} color={colors.icColor} style={{ marginTop: 2 }}/>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: OC.stone800, fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: OC.stone500, marginTop: 2 }}>{sub}</div>
      </div>
      <button style={{ background: 'transparent', border: 'none', color: OC.teal600, fontSize: 11.5, cursor: 'pointer', fontWeight: 500 }}>Fix</button>
    </div>
  );
}

function RowAction({ icon: Ic, active, activeColor, count, title }) {
  const color = active ? activeColor : OC.stone300;
  return (
    <button
      title={title}
      style={{
        position: 'relative',
        width: 22, height: 22, padding: 0,
        background: 'transparent', border: 'none', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color,
      }}
    >
      <Ic size={13} color={color} stroke={active ? 2.4 : 1.8}/>
      {count ? (
        <span style={{
          position: 'absolute', top: -2, right: -2,
          minWidth: 12, height: 12, padding: '0 3px',
          background: OC.teal600, color: OC.white,
          borderRadius: 999, fontSize: 9, fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: OC.font, lineHeight: 1,
        }}>{count}</span>
      ) : null}
    </button>
  );
}

function FilterChip({ label, count, dot, icon: Ic, tone, active }) {
  const isRed = tone === 'red';
  const bg = active ? OC.teal50 : OC.white;
  const bd = active ? OC.teal400 : (isRed ? OC.red100 : OC.stone200);
  const fg = active ? OC.teal700 : (isRed ? OC.red700 : OC.stone700);
  return (
    <button style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      height: 24, padding: '0 8px',
      background: bg, border: `1px solid ${bd}`, borderRadius: 999,
      fontSize: 11.5, color: fg, cursor: 'pointer',
      fontWeight: active ? 600 : 500, whiteSpace: 'nowrap',
    }}>
      {dot}
      {Ic ? <Ic size={11} color={fg}/> : null}
      <span>{label}</span>
      {count != null ? (
        <span style={{
          fontFamily: OC.mono, fontSize: 10.5, fontWeight: 600,
          color: active ? OC.teal700 : OC.stone500,
          background: active ? OC.teal100 : OC.stone100,
          padding: '1px 5px', borderRadius: 4, minWidth: 16, textAlign: 'center',
        }}>{count}</span>
      ) : null}
    </button>
  );
}

Object.assign(window, { Editor });
