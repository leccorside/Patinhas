import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Calendar,
  Sparkles,
  AlertTriangle,
  Heart,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import {
  educationService,
  EducationalArticle,
  PostAdoptionChecklist,
} from './educationService';
import { ArticleDetailModal } from './ArticleDetailModal';
import { PostAdoptionFeedbackModal } from './PostAdoptionFeedbackModal';

interface PostAdoptionViewProps {
  onBack: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const PostAdoptionView: React.FC<PostAdoptionViewProps> = ({
  onBack,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'articles'>('checklist');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('15_DAYS');
  const [checklist, setChecklist] = useState<PostAdoptionChecklist | null>(null);
  const [articles, setArticles] = useState<EducationalArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  // Seleções salvas no localStorage
  const [checkedItemIds, setCheckedItemIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('patinhas_checklist_items');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [selectedArticle, setSelectedArticle] = useState<EducationalArticle | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);

  // Carregar checklist
  const loadChecklist = async (period: string) => {
    try {
      const data = await educationService.getChecklist(period);
      setChecklist(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Carregar artigos
  const loadArticles = async (category: string) => {
    try {
      const data = await educationService.getArticles(category);
      setArticles(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      loadChecklist(selectedPeriod),
      loadArticles(selectedCategory),
    ]).finally(() => setLoading(false));
  }, []);

  const handlePeriodChange = async (period: string) => {
    setSelectedPeriod(period);
    setLoading(true);
    await loadChecklist(period);
    setLoading(false);
  };

  const handleCategoryChange = async (cat: string) => {
    setSelectedCategory(cat);
    setLoading(true);
    await loadArticles(cat);
    setLoading(false);
  };

  const toggleCheckItem = (id: string) => {
    setCheckedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem('patinhas_checklist_items', JSON.stringify([...next]));
      return next;
    });
  };

  const completedCount =
    checklist?.items.filter((it) => checkedItemIds.has(it.id)).length || 0;
  const totalCount = checklist?.items.length || 0;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#F7F7F6] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-gray-900 text-base leading-tight">
              Pós-Adoção & Guia Educativo
            </h1>
            <p className="text-[11px] text-gray-500">Adaptação serena e posse responsável</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex bg-gray-200/70 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'checklist'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Checklist de Adaptação</span>
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'articles'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guia & Artigos</span>
          </button>
        </div>
      </div>

      {/* CONTEÚDO: CHECKLIST DE ADAPTAÇÃO */}
      {activeTab === 'checklist' && (
        <div className="p-4 space-y-4">
          {/* Seletor de Períodos 15 / 30 / 90 dias */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: '15_DAYS', label: '15 Dias', sub: 'Descompressão' },
              { id: '30_DAYS', label: '30 Dias', sub: 'Rotina & Saúde' },
              { id: '90_DAYS', label: '90 Dias', sub: 'Vínculo Pleno' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handlePeriodChange(p.id)}
                className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center ${
                  selectedPeriod === p.id
                    ? 'border-primary-600 bg-primary-50/60 shadow-xs'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <span
                  className={`text-xs font-extrabold ${
                    selectedPeriod === p.id ? 'text-primary-700' : 'text-gray-800'
                  }`}
                >
                  {p.label}
                </span>
                <span className="text-[10px] text-gray-500 font-medium">{p.sub}</span>
              </button>
            ))}
          </div>

          {/* Progresso do Período */}
          <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-gray-800">{checklist?.periodLabel}</span>
              <span className="text-primary-600">{progressPercent}% Concluído</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-500">
              {completedCount} de {totalCount} cuidados essenciais realizados para este período.
            </p>
          </div>

          {/* Lista de Itens do Checklist */}
          <div className="space-y-2.5">
            {checklist?.items.map((item) => {
              const isChecked = checkedItemIds.has(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleCheckItem(item.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 bg-white shadow-xs ${
                    isChecked
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <button className="mt-0.5 text-emerald-600 shrink-0">
                    {isChecked ? (
                      <CheckCircle2 className="w-5 h-5 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300" />
                    )}
                  </button>
                  <div className="space-y-0.5">
                    <h4
                      className={`text-xs font-bold leading-snug ${
                        isChecked ? 'text-gray-800 line-through opacity-80' : 'text-gray-900'
                      }`}
                    >
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botão de Enviar Feedback/Fotos para a ONG */}
          <button
            onClick={() => setIsFeedbackModalOpen(true)}
            className="w-full py-3 bg-white hover:bg-gray-50 border border-primary-200 text-primary-700 font-bold rounded-2xl shadow-xs text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span>Compartilhar Relato e Fotos com a ONG</span>
          </button>

          {/* Aviso Legal Veterinário */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-900 leading-relaxed">
              {checklist?.veterinaryDisclaimer}
            </p>
          </div>
        </div>
      )}

      {/* CONTEÚDO: GUIA & ARTIGOS EDUCATIVOS */}
      {activeTab === 'articles' && (
        <div className="p-4 space-y-4">
          {/* Pílulas de Categoria */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'ALL', label: 'Todos os Artigos' },
              { id: 'Adaptação', label: 'Adaptação' },
              { id: 'Saúde', label: 'Saúde' },
              { id: 'Comportamento', label: 'Comportamento' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Feed de Artigos */}
          <div className="space-y-3">
            {articles.map((art) => (
              <div
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className="bg-white rounded-3xl p-3.5 border border-gray-100 shadow-xs hover:border-primary-200 transition-all cursor-pointer flex gap-3.5 items-center group"
              >
                {art.coverUrl && (
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-xs">
                    <img
                      src={art.coverUrl}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-semibold">
                    <span className="text-primary-600 uppercase tracking-wider">{art.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {art.readTimeMin} min
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-xs leading-snug line-clamp-2">
                    {art.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 line-clamp-1">
                    {art.summary}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            ))}
          </div>

          {/* Aviso Veterinário Geral */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-900 leading-relaxed">
              Conteúdo produzido para orientar os primeiros passos. Dúvidas clínicas devem sempre ser esclarecidas com um médico veterinário.
            </p>
          </div>
        </div>
      )}

      {/* Modal de Leitura de Artigo */}
      {selectedArticle && (
        <ArticleDetailModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}

      {/* Modal de Relato de Feedback */}
      {isFeedbackModalOpen && (
        <PostAdoptionFeedbackModal
          period={selectedPeriod}
          onClose={() => setIsFeedbackModalOpen(false)}
          onSuccess={(msg) => showToast(msg, 'success')}
        />
      )}
    </div>
  );
};

