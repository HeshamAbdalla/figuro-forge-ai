
import React from 'react';
import { useEnhancedAuth } from '@/components/auth/EnhancedAuthProvider';
import { SecurityWrapper } from '@/components/security/SecurityWrapper';
import { AdminRoute } from '@/components/security/AdminRoute';
import { SecurityHealthMonitor } from '@/components/security/SecurityHealthMonitor';
import { AdminUserAssignment } from '@/components/security/AdminUserAssignment';
import { SecurityDashboard as UserSecurityDashboard } from '@/components/security/SecurityDashboard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/**
 * Security Dashboard page - combines admin and user security features
 */
const SecurityDashboard: React.FC = () => {
  const { user } = useEnhancedAuth();

  return (
    <SecurityWrapper requireAuth={true} minSecurityScore={40}>
      <div className="min-h-screen bg-figuro-dark">
        <Header />
        
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-white">
                Security <span className="text-figuro-accent">Dashboard</span>
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Monitor and manage your account security and system health
              </p>
            </div>

            {/* Admin Section */}
            <AdminRoute>
              <div className="bg-white/5 rounded-lg p-6 space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Administrative Security Controls
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">System Health</h3>
                    <SecurityHealthMonitor />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Admin Management</h3>
                    <AdminUserAssignment />
                  </div>
                </div>
              </div>
            </AdminRoute>

            {/* User Security Section */}
            <div className="bg-white/5 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-white mb-6">
                Your Security Overview
              </h2>
              <UserSecurityDashboard />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </SecurityWrapper>
  );
};

export default SecurityDashboard;
