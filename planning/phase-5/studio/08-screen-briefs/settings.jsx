// Settings — Profile / Machine Translation / QA Defaults

function Settings({ tab = 'profile' }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: OC.stone50, fontFamily: OC.font, overflow: 'hidden' }}>
      <Sidebar active="settings" />
      <main style={{ flex: 1, overflow: 'auto', padding: '32px 40px' }}>
        <div style={{ maxWidth: 760 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: OC.stone900, margin: 0 }}>Settings</h1>
          <p style={{ fontSize: 13.5, color: OC.stone500, margin: '4px 0 22px' }}>Manage your profile, MT providers, and default QA checks.</p>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${OC.stone200}` }}>
            {[
              { id: 'profile', label: 'Profile' },
              { id: 'mt',      label: 'Machine Translation' },
              { id: 'qa',      label: 'QA Defaults' },
            ].map((t) => {
              const active = tab === t.id;
              return (
                <div key={t.id} style={{
                  padding: '10px 16px', fontSize: 13.5, fontWeight: 500,
                  color: active ? OC.teal600 : OC.stone500,
                  borderBottom: active ? `2px solid ${OC.teal500}` : '2px solid transparent',
                  marginBottom: -1, cursor: 'pointer',
                }}>{t.label}</div>
              );
            })}
          </div>

          <div style={{ paddingTop: 32 }}>
            {tab === 'profile' && <ProfileTab/>}
            {tab === 'mt' && <MtTab/>}
            {tab === 'qa' && <QaTab/>}
          </div>
        </div>
      </main>
    </div>
  );
}

function ProfileTab() {
  return (
    <div>
      <h2 style={{ fontSize: 17, fontWeight: 600, color: OC.stone900, margin: '0 0 4px' }}>Profile</h2>
      <p style={{ fontSize: 13, color: OC.stone500, margin: '0 0 24px' }}>Your account information and UI preferences.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 480 }}>
        <Field label="Name" required>
          <Input value="Ammar Shaikh"/>
        </Field>
        <Field label="Email" required>
          <Input value="ammar@example.com"/>
        </Field>
        <Field label="UI language" hint="UI language only. Source and target languages are set per project.">
          <Select value="English"/>
        </Field>
      </div>

      <div style={{ height: 1, background: OC.stone200, margin: '32px 0' }}/>

      <h3 style={{ fontSize: 14, fontWeight: 600, color: OC.stone900, margin: '0 0 12px' }}>Password</h3>
      <p style={{ fontSize: 12.5, color: OC.stone500, margin: '0 0 16px' }}>Last changed Mar 4, 2026.</p>
      <Btn variant="secondary" size="md">Change password…</Btn>

      <div style={{ height: 1, background: OC.stone200, margin: '32px 0' }}/>

      <div style={{ display: 'flex', gap: 8 }}>
        <Btn variant="primary" size="md">Save changes</Btn>
        <Btn variant="ghost" size="md">Discard</Btn>
      </div>

      {/* Toast preview */}
      <div style={{ position: 'absolute', bottom: 32, right: 32 }}>
        <div style={{
          background: OC.green100, border: `1px solid ${OC.green500}`, color: OC.green700,
          fontSize: 13, padding: '10px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        }}>
          <I.Check size={14} color={OC.green600}/> Changes saved.
        </div>
      </div>
    </div>
  );
}

function MtTab() {
  return (
    <div>
      <h2 style={{ fontSize: 17, fontWeight: 600, color: OC.stone900, margin: '0 0 4px' }}>Machine Translation Providers</h2>
      <p style={{ fontSize: 13, color: OC.stone500, margin: '0 0 24px' }}>API keys are stored encrypted and never shared.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ProviderCard
          name="DeepL"
          letter="D"
          color={OC.sky600}
          status="connected"
          masked="••••••••••••••••••••f4a2"
        />
        <ProviderCard
          name="Google Translate"
          letter="G"
          color={OC.amber600}
          status="empty"
          placeholder="Paste your Google Cloud API key…"
        />
        <ProviderCard
          name="Azure Translator"
          letter="A"
          color={OC.violet600}
          status="empty"
          placeholder="Paste your Azure resource key…"
          collapsed
        />
      </div>

      <div style={{ height: 1, background: OC.stone200, margin: '28px 0' }}/>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 480 }}>
        <Field label="Default MT provider" hint="Used when no project-level provider is specified.">
          <Select value="DeepL"/>
        </Field>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: 16, background: OC.stone50, border: `1px solid ${OC.stone200}`, borderRadius: 8 }}>
          <Switch on/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: OC.stone800 }}>Auto-request MT suggestions in editor</div>
            <div style={{ fontSize: 12, color: OC.stone500, marginTop: 4, lineHeight: '18px' }}>
              Automatically fetch MT for each segment as you open it. Disable to keep editor offline-only.
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 28 }}>
        <Btn variant="primary" size="md">Save settings</Btn>
      </div>
    </div>
  );
}

function ProviderCard({ name, letter, color, status, masked, placeholder, collapsed }) {
  const isConnected = status === 'connected';
  return (
    <div style={{ background: OC.white, border: `1px solid ${OC.stone200}`, borderRadius: 10, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: collapsed ? 0 : 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: color, color: OC.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, fontFamily: OC.mono }}>
          {letter}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: OC.stone900 }}>{name}</div>
          <div style={{ fontSize: 12, color: OC.stone500, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
            {isConnected ? (
              <><I.Check size={12} color={OC.green600}/><span style={{ color: OC.green700, fontWeight: 500 }}>Connected</span><span>· 3,420 chars used this month</span></>
            ) : (
              <><span style={{ color: OC.stone400 }}>—</span><span>Not configured</span></>
            )}
          </div>
        </div>
        {collapsed && <I.ChevD size={16} color={OC.stone400}/>}
      </div>

      {!collapsed && (
        <>
          <Field label="API key">
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Input value={isConnected ? masked : ''} placeholder={placeholder}/>
                {isConnected && (
                  <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 2 }}>
                    <button style={{ background: 'transparent', border: 'none', padding: 6, cursor: 'pointer', color: OC.stone500, display: 'flex' }}>
                      <I.Eye size={14}/>
                    </button>
                  </div>
                )}
              </div>
              <Btn variant="secondary" size="md" icon={I.Zap}>Test</Btn>
            </div>
          </Field>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Btn variant="primary" size="sm">Save</Btn>
            {isConnected && <Btn variant="secondary" size="sm" icon={I.Trash}>Remove</Btn>}
            {!isConnected && <a style={{ fontSize: 12.5, color: OC.teal600, alignSelf: 'center', marginLeft: 4 }}>Get an API key →</a>}
          </div>
        </>
      )}
    </div>
  );
}

function QaTab() {
  const checks = [
    { id: 'tag',    label: 'Tag consistency',         desc: 'Flag segments where inline tags in source are missing or mismatched in target.', checked: true },
    { id: 'len',    label: 'Length ratio',            desc: 'Flag segments where target is much longer or shorter than source.', checked: true, ratio: '2.5' },
    { id: 'trail',  label: 'Trailing whitespace',     desc: 'Flag trailing whitespace in target.', checked: true },
    { id: 'double', label: 'Double spaces',           desc: 'Flag consecutive spaces inside target.', checked: true },
    { id: 'term',   label: 'Terminology consistency', desc: 'Flag segments where glossary terms are not translated using the approved target term.', checked: true },
    { id: 'num',    label: 'Number consistency',      desc: 'Flag segments where numbers in source don\u2019t appear in target.', checked: true },
    { id: 'punct',  label: 'Punctuation parity',      desc: 'Flag mismatched terminal punctuation between source and target.', checked: false },
  ];

  return (
    <div>
      <h2 style={{ fontSize: 17, fontWeight: 600, color: OC.stone900, margin: '0 0 4px' }}>QA Check Defaults</h2>
      <p style={{ fontSize: 13, color: OC.stone500, margin: '0 0 24px' }}>These settings apply when creating new projects. You can override them per project.</p>

      <div style={{ background: OC.white, border: `1px solid ${OC.stone200}`, borderRadius: 10, padding: '4px 20px' }}>
        {checks.map((c, i) => (
          <div key={c.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 14, padding: '18px 0',
            borderBottom: i < checks.length - 1 ? `1px solid ${OC.stone100}` : 'none',
          }}>
            <Checkbox checked={c.checked}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: OC.stone800 }}>{c.label}</div>
              <div style={{ fontSize: 12.5, color: OC.stone500, marginTop: 4, lineHeight: '18px', maxWidth: 480 }}>{c.desc}</div>
              {c.ratio && (
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12.5, color: OC.stone600 }}>Max ratio:</span>
                  <input
                    defaultValue={c.ratio}
                    style={{
                      width: 64, height: 30, border: `1px solid ${OC.stone300}`, borderRadius: 6,
                      fontSize: 13, padding: '0 8px', textAlign: 'center', fontFamily: OC.mono, color: OC.stone900, outline: 'none',
                    }}
                  />
                  <span style={{ fontSize: 12.5, color: OC.stone500 }}>× source length</span>
                </div>
              )}
            </div>
            {c.checked && <Badge tone="green">Active</Badge>}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
        <Btn variant="primary" size="md">Save defaults</Btn>
        <Btn variant="ghost" size="md">Reset to recommended</Btn>
      </div>
    </div>
  );
}

Object.assign(window, { Settings });
