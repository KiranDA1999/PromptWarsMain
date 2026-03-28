import React from 'react';
import { motion } from 'motion/react';
import { X, ChevronRight, LogOut } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface ProfileSectionProps {
  user: FirebaseUser;
  onClose: () => void;
  onLogout: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ user, onClose, onLogout }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 p-8 flex flex-col border-l border-gray-100"
  >
    <div className="flex justify-between items-center mb-12">
      <h2 className="text-2xl font-black tracking-tight">Profile</h2>
      <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
        <X size={24} />
      </button>
    </div>

    <div className="flex flex-col items-center text-center mb-12">
      <div className="w-24 h-24 rounded-full border-4 border-gray-50 p-1 mb-4 shadow-lg overflow-hidden">
        <img src={user.photoURL || ''} alt={user.displayName || 'User'} className="w-full h-full object-cover rounded-full" />
      </div>
      <h3 className="text-xl font-bold">{user.displayName}</h3>
      <p className="text-gray-400 text-sm mb-6">{user.email}</p>
      
      <div className="w-full grid grid-cols-2 gap-3">
        <div className="p-4 bg-gray-50 rounded-2xl">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
          <p className="text-xs font-bold text-green-600">Verified</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-2xl">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tier</p>
          <p className="text-xs font-bold text-black">Pro</p>
        </div>
      </div>
    </div>

    <div className="space-y-4 flex-grow">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Account Settings</p>
      <button className="w-full text-left p-4 hover:bg-gray-50 rounded-2xl transition-colors flex items-center justify-between group">
        <span className="font-medium">Security & Privacy</span>
        <ChevronRight size={16} className="text-gray-300 group-hover:text-black transition-colors" />
      </button>
      <button className="w-full text-left p-4 hover:bg-gray-50 rounded-2xl transition-colors flex items-center justify-between group">
        <span className="font-medium">Notification Preferences</span>
        <ChevronRight size={16} className="text-gray-300 group-hover:text-black transition-colors" />
      </button>
    </div>

    <button 
      onClick={onLogout}
      className="w-full flex items-center justify-center gap-3 p-5 bg-red-50 text-red-600 rounded-[2rem] font-bold hover:bg-red-100 transition-all mt-auto"
    >
      <LogOut size={20} />
      Sign Out Securely
    </button>
  </motion.div>
);
