import React from 'react';
import { motion } from 'motion/react';
import { Search, History, Trash2, ArrowRight } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryVaultProps {
  filteredHistory: HistoryItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string, e: React.MouseEvent) => void;
}

export const HistoryVault: React.FC<HistoryVaultProps> = ({
  filteredHistory,
  searchQuery,
  setSearchQuery,
  onSelectItem,
  onDeleteItem
}) => (
  <motion.section 
    id="history-section"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="bg-white rounded-5xl p-10 shadow-xl border border-gray-100"
    aria-labelledby="history-heading"
  >
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
      <div>
        <h2 id="history-heading" className="text-3xl font-black tracking-tighter uppercase">Intelligence Vault</h2>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Cloud Synced History</p>
      </div>
      <div className="relative w-full md:w-80">
        <label htmlFor="history-search" className="sr-only">Search history</label>
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} aria-hidden="true" />
        <input 
          id="history-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search past insights..."
          className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-3xl border border-gray-100 focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-medium"
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredHistory.length > 0 ? (
        filteredHistory.map((item) => (
          <motion.div 
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group p-6 bg-gray-50/50 rounded-4xl border border-gray-100 hover:border-accent/30 transition-all hover:bg-white hover:shadow-xl cursor-pointer relative"
            onClick={() => onSelectItem(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectItem(item); }}
            aria-label={`View analysis for: ${item.input.substring(0, 50)}...`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                item.output.urgency === 'High' ? 'bg-red-100 text-red-600' : 
                item.output.urgency === 'Medium' ? 'bg-orange-100 text-orange-600' : 
                'bg-blue-100 text-blue-600'
              }`}>
                {item.output.urgency}
              </span>
              <button 
                onClick={(e) => onDeleteItem(item.id, e)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Delete analysis"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <h3 className="font-bold text-lg mb-2 line-clamp-1">{item.output.intent}</h3>
            <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">{item.output.summary}</p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                {new Date(item.timestamp).toLocaleDateString()}
              </span>
              <ArrowRight size={14} className="text-gray-300 group-hover:text-accent group-hover:translate-x-1 transition-all" aria-hidden="true" />
            </div>
          </motion.div>
        ))
      ) : (
        <div className="col-span-full py-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <History size={32} className="text-gray-200" aria-hidden="true" />
          </div>
          <p className="text-gray-400 font-bold uppercase tracking-widest">No intelligence found</p>
        </div>
      )}
    </div>
  </motion.section>
);
