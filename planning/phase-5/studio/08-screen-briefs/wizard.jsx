// Project Wizard — 3 steps. Step shown via prop.

function Wizard({ step = 1 }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: OC.stone50, fontFamily: OC.font, overflow: 'hidden' }}>
      <Sidebar active="dashboard" />
      <main style={{ flex: 1, overflow: 'auto', padding: '32px 40px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: 12.5, color: OC.stone400, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Dashboard</span>
            <I.ChevR size={12}/>
            <span style={{ color: OC.stone700 }}>Create project</span>
          </div>

          {/* Step indicator */}
          <StepIndicator current={step}/>

          {/* Card */}
          <div style={{ background: OC.white, border: `1px solid ${OC.stone200}`, borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', padding: 32, marginTop: 32 }}>
            {step === 1 && <Step1 />}
            {step === 2 && <Step2 />}
            {step === 3 && <Step3 />}
          </div>
        </div>
      </main>
    </div>
  );
}

function StepIndicator({ current }) {
  const steps = [
    { n: 1, label: 'Project details' },
    { n: 2, label: 'Translation memory' },
    { n: 3, label: 'Upload files' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, padding: '8px 32px' }}>
      {steps.map((s, i) => {
        const done = current > s.n;
        const active = current === s.n;
        return (
          <React.Fragment key={s.n}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 80 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: done || active ? OC.teal500 : OC.white,
                border: done || active ? 'none' : `2px solid ${OC.stone300}`,
                color: done || active ? OC.white : OC.stone400,
                boxShadow: active ? `0 0 0 4px ${OC.teal100}` : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12.5, fontWeight: 600,
              }}>
                {done ? <I.CheckSm size={14} stroke={3}/> : s.n}
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 500, color: active ? OC.teal700 : (done ? OC.stone700 : OC.stone400), textAlign: 'center', whiteSpace: 'nowrap' }}>
                {s.label}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: current > s.n ? OC.teal500 : OC.stone200, marginTop: 13, marginLeft: -8, marginRight: -8 }}/>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function StepHeader({ title, n }) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: OC.stone900, margin: 0 }}>{title}</h2>
        <span style={{ fontSize: 13, color: OC.stone400 }}>Step {n} of 3</span>
      </div>
      <div style={{ height: 1, background: OC.stone200, margin: '20px 0 24px' }}/>
    </>
  );
}

function StepFooter({ left, right, rightDisabled }) {
  return (
    <>
      <div style={{ height: 1, background: OC.stone200, margin: '28px 0 20px' }}/>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {left || <Btn variant="ghost" size="md">Cancel</Btn>}
        {right || <Btn variant="primary" size="md" iconR={I.ArrowR} disabled={rightDisabled}>Next</Btn>}
      </div>
    </>
  );
}

function Step1() {
  return (
    <>
      <StepHeader title="Create a project" n={1}/>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Field label="Project name" required>
          <Input value="Legal Contract Translation" focused/>
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Source language" required>
            <Select value="English (en-US)"/>
          </Field>
          <Field label="Target language" required>
            <Select value="Urdu (ur)"/>
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Character limit per segment" hint="Optional. Editor will color-code each segment against this limit.">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Input value="120" style={{ width: 96, fontFamily: OC.mono }}/>
              <span style={{ fontSize: 12.5, color: OC.stone500 }}>characters per segment</span>
            </div>
          </Field>
          <Field label="Soft warning threshold" hint="Show amber when target reaches this % of the limit.">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Input value="90" style={{ width: 96, fontFamily: OC.mono }}/>
              <span style={{ fontSize: 12.5, color: OC.stone500 }}>%</span>
            </div>
          </Field>
        </div>

        <Field label="Description" hint="Optional: project notes, client name, domain…">
          <textarea
            placeholder="e.g. Acme Corp · Q1 2026 contract package"
            rows={3}
            style={{
              padding: '10px 12px', fontSize: 14, color: OC.stone900,
              background: OC.white, border: `1px solid ${OC.stone300}`, borderRadius: 6,
              outline: 'none', fontFamily: OC.font, resize: 'none', width: '100%', boxSizing: 'border-box',
            }}
          />
        </Field>

        <div style={{ background: OC.sky50, border: `1px solid ${OC.sky200}`, borderRadius: 6, padding: '10px 12px', display: 'flex', gap: 10, fontSize: 12.5, color: OC.sky700 }}>
          <I.Info size={14} color={OC.sky600} style={{ marginTop: 1 }}/>
          <span>Both EN and UR are supported. Urdu will render right-to-left in the translation editor.</span>
        </div>
      </div>

      <StepFooter/>
    </>
  );
}

function Step2() {
  return (
    <>
      <StepHeader title="Translation Memory" n={2}/>

      <p style={{ fontSize: 13.5, color: OC.stone600, lineHeight: '20px', margin: '0 0 20px' }}>
        Translations you confirm are saved automatically and suggested as matches in future projects.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Project TM box */}
        <div style={{ background: OC.stone50, border: `1px solid ${OC.stone200}`, borderRadius: 8, padding: 18 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: OC.stone400, marginBottom: 14 }}>
            Project TM
          </div>
          <div style={{ display: 'flex', gap: 12, opacity: 0.85 }}>
            <Checkbox checked disabled/>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: OC.stone800 }}>Create a project TM for this project</div>
              <div style={{ fontSize: 12.5, color: OC.stone500, marginTop: 4, lineHeight: '18px' }}>
                Translations you confirm in this project are saved here automatically. Required.
              </div>
            </div>
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px dashed ${OC.stone200}`, display: 'flex', alignItems: 'center', gap: 6, color: OC.teal600, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            <I.ChevR size={14}/> Import an existing TMX file
          </div>
        </div>

        {/* Global TM box */}
        <div style={{ background: OC.stone50, border: `1px solid ${OC.stone200}`, borderRadius: 8, padding: 18 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: OC.stone400, marginBottom: 14 }}>
            Global TM
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Checkbox checked/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: OC.stone800 }}>Also use the global TM <span style={{ color: OC.stone400, fontWeight: 400 }}>· 12,840 entries</span></div>
              <div style={{ fontSize: 12.5, color: OC.stone500, marginTop: 4, lineHeight: '18px' }}>
                Matches from all your past EN→UR projects appear in the TM panel. Confirmed translations are saved to both TMs.
              </div>
            </div>
          </div>
        </div>

        {/* MT preview / connection */}
        <div style={{ background: OC.white, border: `1px solid ${OC.stone200}`, borderRadius: 8, padding: 18 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, color: OC.stone400, marginBottom: 14 }}>
            Match thresholds
          </div>
          <div style={{ fontSize: 13, color: OC.stone700, marginBottom: 12 }}>Show TM matches in editor when similarity is at least:</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <input type="range" min="50" max="100" defaultValue="75" style={{ flex: 1, accentColor: OC.teal500 }}/>
            <div style={{ background: OC.teal50, color: OC.teal700, fontSize: 13, fontWeight: 600, padding: '4px 10px', borderRadius: 6, minWidth: 56, textAlign: 'center' }}>75%</div>
          </div>
        </div>
      </div>

      <StepFooter
        left={<Btn variant="ghost" size="md" icon={I.ChevL}>Back</Btn>}
      />
    </>
  );
}

function Step3() {
  return (
    <>
      <StepHeader title="Upload your files" n={3}/>

      <div style={{
        border: `2px dashed ${OC.stone300}`, borderRadius: 12, background: OC.stone50,
        padding: '40px 24px', textAlign: 'center',
      }}>
        <div style={{ width: 48, height: 48, margin: '0 auto 14px', borderRadius: 12, background: OC.white, border: `1px solid ${OC.stone200}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <I.Upload size={22} color={OC.stone400}/>
        </div>
        <div style={{ fontSize: 14, fontWeight: 500, color: OC.stone700, marginBottom: 4 }}>
          Drop files here, or <span style={{ color: OC.teal600, textDecoration: 'underline' }}>click to browse</span>
        </div>
        <div style={{ fontSize: 11.5, color: OC.stone400, lineHeight: '18px' }}>
          Supported: DOCX · PPTX · XLSX · HTML · TXT · PO · XLIFF · XML
          <br/>
          Max 50 MB per file
        </div>
      </div>

      {/* File list */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <FileRow name="contract.docx"   fmt="DOCX" size="123 KB" />
        <FileRow name="amendment-A.docx" fmt="DOCX" size="48 KB"  />
        <FileRow name="slides.pptx"     fmt="PPTX" size="4.2 MB" />
      </div>

      {/* MT pre-fill — collapsed */}
      <div style={{
        marginTop: 24, padding: 14, background: OC.stone50, border: `1px solid ${OC.stone200}`, borderRadius: 8,
        display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
      }}>
        <I.ChevR size={14} color={OC.stone400}/>
        <span style={{ fontSize: 13, color: OC.stone600, flex: 1 }}>
          Auto-fill untranslated segments with machine translation
        </span>
        <Badge tone="stone">Optional</Badge>
      </div>

      <StepFooter
        left={<Btn variant="ghost" size="md" icon={I.ChevL}>Back</Btn>}
        right={<Btn variant="primary" size="md" iconR={I.ArrowR}>Create project</Btn>}
      />
    </>
  );
}

function FileRow({ name, fmt, size }) {
  return (
    <div style={{
      background: OC.white, border: `1px solid ${OC.stone200}`, borderRadius: 8,
      padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <I.File size={16} color={OC.stone400}/>
      <span style={{ fontSize: 13.5, fontWeight: 500, color: OC.stone800, flex: 1 }}>{name}</span>
      <Badge tone="teal">{fmt}</Badge>
      <span style={{ fontSize: 12, color: OC.stone400, fontVariantNumeric: 'tabular-nums', minWidth: 56, textAlign: 'right' }}>{size}</span>
      <button style={{ background: 'transparent', border: 'none', color: OC.stone400, cursor: 'pointer', padding: 4, display: 'flex' }}>
        <I.X size={14}/>
      </button>
    </div>
  );
}

Object.assign(window, { Wizard });
