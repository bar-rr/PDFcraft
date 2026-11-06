import React from 'react';
import { FileText, User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUsageLimit } from '../hooks/useUsageLimit';

export const Header = () => {
  const { user, signInWithGoogle, logout } = useAuth();
  const { remainingUses, isPremium } = useUsageLimit();

  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">PDFcraft</h1>
          </div>

          <div className="flex items-center space-x-4">
            {!isPremium && (
              <div className="text-white/80 text-sm">
                {remainingUses} uses remaining today
              </div>
            )}
            
            {isPremium && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 rounded-full text-white text-sm font-medium">
                Premium
              </div>
            )}

            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <img
                    src={user.photoURL || ''}
                    alt={user.displayName || ''}
                    className="h-8 w-8 rounded-full"
                  />
                  <span className="text-white text-sm">{user.displayName}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-white/80 hover:text-white transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center space-x-2 bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};