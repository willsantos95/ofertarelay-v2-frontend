import { useEffect, useState } from 'react';
import { Save, Loader2, Info } from 'lucide-react';
import { api } from '../lib/api';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';

type AffPayload = {
  amazon:       { tag: string; cookies: string };
  mercadoLivre: { tag: string; cookies: string; urls: string };
  shopee:       { appId: string; appSecret: string };
  magalu:       { magazineId: string };
  aliexpress:   { apiKey: string; apiSecret: string; trackingId: string };
};

const EMPTY: AffPayload = {
  amazon:       { tag: '', cookies: '' },
  mercadoLivre: { tag: '', cookies: '', urls: '' },
  shopee:       { appId: '', appSecret: '' },
  magalu:       { magazineId: '' },
  aliexpress:   { apiKey: '', apiSecret: '', trackingId: '' },
};

function Field({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input type={type} className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function PlatCard({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-gray-800 mb-4">{titulo}</h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

export default function AffiliateSettings() {
  const [form, setForm]     = useState<AffPayload>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]   = useState('');
  const [erro, setErro] = useState('');

  function set<K extends keyof AffPayload>(plat: K, key: keyof AffPayload[K], val: string) {
    setForm((prev) => ({ ...prev, [plat]: { ...prev[plat], [key]: val } }));
  }

  useEffect(() => {
    api<{ setting: { payload: AffPayload } }>('/settings/affiliate')
      .then((r) => setForm({ ...EMPTY, ...r.setting.payload }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function salvar() {
    setSaving(true); setMsg(''); setErro('');
    try {
      await api('/settings/affiliate', { method: 'PUT', body: JSON.stringify(form) });
      setMsg('Configurações salvas com sucesso!');
    } catch (e) {
      setErro((e as Error).message || 'Erro ao salvar');
    } finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  return (
    <>
      <PageHeader
        title="Configurações de Afiliado"
        subtitle="Credenciais usadas para gerar links de afiliado automaticamente"
        action={
          <button onClick={salvar} disabled={saving} className="btn btn-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar
          </button>
        }
      />

      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-6 text-sm text-amber-800">
        <Info className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
        <p>Só serão processadas ofertas das plataformas com credenciais cadastradas. Plataformas sem credenciais serão ignoradas.</p>
      </div>

      <Alert message={erro} />
      <Alert message={msg} type="success" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PlatCard titulo="🇧🇷 Amazon">
          <Field label="Tag de afiliado" value={form.amazon.tag} onChange={(v) => set('amazon', 'tag', v)} placeholder="ex: oferta-20" />
          <Field label="Cookies" value={form.amazon.cookies} onChange={(v) => set('amazon', 'cookies', v)} type="password" placeholder="Cole seus cookies aqui" />
        </PlatCard>

        <PlatCard titulo="🛒 Mercado Livre">
          <Field label="Tag de afiliado" value={form.mercadoLivre.tag} onChange={(v) => set('mercadoLivre', 'tag', v)} placeholder="ex: GT20240630184403" />
          <Field label="Cookies" value={form.mercadoLivre.cookies} onChange={(v) => set('mercadoLivre', 'cookies', v)} type="password" placeholder="Cole seus cookies do navegador (F12 → Network → header Cookie)" />
          <div>
            <label className="label">URLs para buscar ofertas <span className="text-gray-400 font-normal">(uma por linha)</span></label>
            <textarea
              className="input min-h-[80px] resize-y text-xs font-mono"
              value={form.mercadoLivre.urls}
              onChange={(e) => set('mercadoLivre', 'urls', e.target.value)}
              placeholder={`https://lista.mercadolivre.com.br/eletronicos\nhttps://lista.mercadolivre.com.br/celular`}
            />
            <p className="text-xs text-gray-400 mt-1">URLs de páginas de categoria ou busca do Mercado Livre.</p>
          </div>
        </PlatCard>

        <PlatCard titulo="🟠 Shopee">
          <Field label="App ID" value={form.shopee.appId} onChange={(v) => set('shopee', 'appId', v)} placeholder="Seu App ID da Shopee" />
          <Field label="App Secret" value={form.shopee.appSecret} onChange={(v) => set('shopee', 'appSecret', v)} type="password" placeholder="Seu App Secret" />
        </PlatCard>

        <PlatCard titulo="🟦 Magalu">
          <Field label="ID Magazine Você" value={form.magalu.magazineId} onChange={(v) => set('magalu', 'magazineId', v)} placeholder="Seu ID Magazine Você" />
        </PlatCard>

        <PlatCard titulo="🔴 AliExpress">
          <Field label="API Key" value={form.aliexpress.apiKey} onChange={(v) => set('aliexpress', 'apiKey', v)} placeholder="Sua API Key" />
          <Field label="API Secret" value={form.aliexpress.apiSecret} onChange={(v) => set('aliexpress', 'apiSecret', v)} type="password" placeholder="Seu API Secret" />
          <Field label="Tracking ID" value={form.aliexpress.trackingId} onChange={(v) => set('aliexpress', 'trackingId', v)} placeholder="Seu Tracking ID" />
        </PlatCard>
      </div>

      <div className="mt-6">
        <button onClick={salvar} disabled={saving} className="btn btn-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar configurações
        </button>
      </div>
    </>
  );
}
