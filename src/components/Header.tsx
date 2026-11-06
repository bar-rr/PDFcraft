import { FileText, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUsageLimit } from '../hooks/useUsageLimit';
import { useLang } from '../i18n';

export const Header = () => {
  const { user, signInWithGoogle, logout } = useAuth();
  const { remainingUses, isPremium } = useUsageLimit();
  const { lang, setLang, t } = useLang();

  return (
    <header className="border-b border-white/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="border border-white/40 p-2">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold uppercase tracking-widest text-white">PDFcraft</div>
            <a
              href={`https://www.barisy.org/#/work`}
              className="text-[11px] uppercase tracking-widest text-white/60 hover:text-white"
            >
              ← by barisy.org
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {!isPremium ? (
            <div className="flex items-center gap-2 text-white/80">
              <span className="status-dot" />
              {t('usesLeft', { n: remainingUses })}
            </div>
          ) : (
            <div className="border border-[#ffd180] text-[#ffd180] px-3 py-1 uppercase tracking-widest">
              {t('premium')}
            </div>
          )}

          <div className="flex gap-1.5">
            {(['en', 'tr'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-1 border uppercase tracking-widest transition-colors ${
                  lang === l ? 'border-white text-white bg-white/10' : 'border-white/20 text-white/70 hover:text-white hover:border-white/40'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              {user.photoURL && <img src={user.photoURL} alt="" className="h-7 w-7 rounded-full" />}
              <span className="text-white/90 hidden sm:inline">{user.displayName}</span>
              <button onClick={logout} title={t('signOut')} className="p-1.5 text-white/70 hover:text-white">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="border border-white/40 px-3 py-1.5 uppercase tracking-widest text-white hover:bg-white/10 transition-colors"
            >
              {t('signIn')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
