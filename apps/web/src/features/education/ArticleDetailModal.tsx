import React from 'react';
import { X, Clock, Share2, AlertTriangle, BookOpen } from 'lucide-react';
import { EducationalArticle } from './educationService';

interface ArticleDetailModalProps {
  article: EducationalArticle;
  onClose: () => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({
  article,
  onClose,
}) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: window.location.href,
        });
      } catch (e) {
        // Ignora cancelamento
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-[430px] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider">
                {article.category}
              </span>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {article.readTimeMin} min de leitura
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="p-1.5 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {article.coverUrl && (
            <div className="w-full h-44 rounded-2xl overflow-hidden shadow-xs">
              <img
                src={article.coverUrl}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h2 className="text-lg font-bold text-gray-900 leading-tight">
            {article.title}
          </h2>

          <p className="text-xs font-medium text-gray-500 italic bg-gray-50 p-3 rounded-xl border border-gray-100">
            "{article.summary}"
          </p>

          <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-line space-y-2">
            {article.content}
          </div>

          {/* Aviso Legal Veterinário Obrigatório */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-1.5 mt-4">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Aviso Importante</span>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              As informações contidas neste artigo têm caráter exclusivamente educativo e orientativo. Não substituem o diagnóstico, consulta e conduta de um médico veterinário devidamente registrado no CRMV.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
