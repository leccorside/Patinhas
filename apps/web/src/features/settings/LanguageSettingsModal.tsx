import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Globe, Check, Sparkles } from 'lucide-react';

interface LanguageSettingsModalProps {
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
}

const LANGUAGES: LanguageOption[] = [
  {
    code: 'pt-BR',
    name: 'Português',
    nativeName: 'Português (Brasil)',
    flag: '🇧🇷',
    region: 'Brasil (BRL, km, 24h)',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English (US)',
    flag: '🇺🇸',
    region: 'United States (USD, mi, 12h)',
  },
  {
    code: 'es',
    name: 'Español',
    nativeName: 'Español (Latinoamérica)',
    flag: '🇪🇸',
    region: 'América Latina (km, 24h)',
  },
];

export const LanguageSettingsModal: React.FC<LanguageSettingsModalProps> = ({
  onClose,
  showToast,
}) => {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language || 'pt-BR';

  const handleSelectLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('patinhas_lng', code);
    showToast(
      code === 'pt-BR'
        ? 'Idioma alterado para Português!'
        : code === 'en'
        ? 'Language changed to English!'
        : '¡Idioma cambiado a Español!',
      'success',
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-[430px] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-primary-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                {t('language.title', 'Idioma e Região')}
              </h3>
              <p className="text-xs text-gray-600">
                {t('language.subtitle', 'Selecione o idioma da interface')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Opções de Idioma */}
        <div className="p-4 space-y-2.5">
          {LANGUAGES.map((lang) => {
            const isSelected =
              currentLang === lang.code ||
              (currentLang.startsWith('pt') && lang.code === 'pt-BR') ||
              (currentLang.startsWith('en') && lang.code === 'en') ||
              (currentLang.startsWith('es') && lang.code === 'es');

            return (
              <button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-primary-600 bg-primary-50/50 shadow-xs'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" role="img" aria-label={lang.name}>
                    {lang.flag}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">
                        {lang.nativeName}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] bg-primary-600 text-white px-2 py-0.5 rounded-full font-bold">
                          Ativo
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-500">{lang.region}</span>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-gray-200" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary-500" />
            <span>Tradução e formatos instantâneos</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-xs"
          >
            {t('common.close', 'Fechar')}
          </button>
        </div>
      </div>
    </div>
  );
};

