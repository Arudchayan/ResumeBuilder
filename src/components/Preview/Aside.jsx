import { memo } from "react";
import { cleanText, normalizeUrl, formatLocation } from "../../utils/dataHelpers";

const Aside = memo(function Aside({ state, sectionVisibility }) {
  const isVisible = (sectionId) => sectionVisibility?.[sectionId] !== false;
  const photoSrc = state.photo?.enabled ? (state.photo?.dataUrl || state.photo?.url) : "";
  
  return (
    <div>
      {photoSrc && isVisible('photo') ? (
        <div className="flex items-center justify-center mb-6">
          <img src={photoSrc} alt="Profile photo" className="w-28 h-28 rounded-full object-cover border shadow-sm" />
        </div>
      ) : null}

      {isVisible('contact') && (
        <>
          <h4 className="text-[12px] uppercase tracking-[0.18em] font-extrabold mb-2" style={{ color: 'var(--theme-dark)' }}>Details</h4>
          <KV k="Location" v={formatLocation(state.contact.location)} />
          <KV k="Phone" v={state.contact.phone} />
          <KV k="Email" v={state.contact.email} />
        </>
      )}

      {state.links?.length && isVisible('contact') ? (
        <>
          <h4 className="text-[12px] uppercase tracking-[0.18em] font-extrabold mt-6 mb-2" style={{ color: 'var(--theme-dark)' }}>Links</h4>
          <div className="space-y-1.5">
            {state.links.map((l, i) => {
              const href = normalizeUrl(l.url || "");
              const label = cleanText(l.label || "");
              if(!href || !label) return null;
              return (
                <div key={i}>
                  <a 
                    href={href} 
                    target="_blank" 
                    rel="noreferrer noopener" 
                    className="text-[12px] hover:underline font-medium block"
                    style={{ color: 'var(--theme-primary)' }}
                  >
                    {label}
                  </a>
                </div>
              );
            })}
          </div>
        </>
      ) : null}

      {state.skills?.length && isVisible('skills') ? (
        <>
          <h4 className="text-[12px] uppercase tracking-[0.18em] font-extrabold mt-6 mb-2" style={{ color: 'var(--theme-dark)' }}>Skills</h4>
          <div className="flex flex-wrap gap-2">
            {state.skills.map((s, i) => (
              <span key={i} className="px-3 py-1 rounded-full border text-[11.5px] bg-slate-50">{cleanText(s)}</span>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
});

const KV = memo(function KV({ k, v, href }) {
  const text = cleanText(v);
  if (!text) return null;
  return (
    <div className="text-[12px] text-slate-800 my-2">
      <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">{k}</div>
      <div className="break-all overflow-wrap-anywhere leading-relaxed">
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: 'var(--theme-primary)' }}>{text}</a>
        ) : (
          <span>{text}</span>
        )}
      </div>
    </div>
  );
});

export default Aside;
