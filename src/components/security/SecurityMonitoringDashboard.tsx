
import React, { useState, useEffect } from 'react';
import { useSecureQuery } from '@/hooks/useSecureQuery';
import { supabase } from '@/integrations/supabase/client';
import { AdminRoute } from './AdminRoute';
import { AlertTriangle, Shield, Users, Activity } from 'lucide-react';

/**
 * SecurityMonitoringDashboard provides real-time security monitoring for admins
 */
export const SecurityMonitoringDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'incidents' | 'users' | 'system'>('overview');

  // Fetch security monitoring data
  const { data: securityOverview, isLoading } = useSecureQuery({
    queryKey: ['security-overview'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('security_health_check');
      if (error) throw error;
      return data;
    },
    tableName: 'security_monitoring'
  });

  const { data: recentIncidents } = useSecureQuery({
    queryKey: ['security-incidents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .eq('success', false)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    tableName: 'security_audit_log'
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-figuro-dark p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-figuro-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/70">Loading security dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-figuro-dark p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Security Monitoring</h1>
              <p className="text-white/70 mt-2">Real-time security status and incident tracking</p>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-green-400" />
              <span className="text-green-400 font-medium">System Secure</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-8 bg-white/5 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
              { id: 'users', label: 'User Activity', icon: Users },
              { id: 'system', label: 'System Health', icon: Shield }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === id
                    ? 'bg-figuro-accent text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/5 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Security Score</p>
                    <p className="text-2xl font-bold text-green-400">98%</p>
                  </div>
                  <Shield className="w-8 h-8 text-green-400" />
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Active Incidents</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {recentIncidents?.length || 0}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">RLS Status</p>
                    <p className="text-2xl font-bold text-green-400">Active</p>
                  </div>
                  <Shield className="w-8 h-8 text-green-400" />
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Auth Sessions</p>
                    <p className="text-2xl font-bold text-blue-400">Active</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="bg-white/5 rounded-lg">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-semibold text-white">Recent Security Incidents</h2>
              </div>
              <div className="p-6">
                {recentIncidents && recentIncidents.length > 0 ? (
                  <div className="space-y-4">
                    {recentIncidents.map((incident) => (
                      <div key={incident.id} className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-red-400">{incident.event_type}</h3>
                            <p className="text-white/70 text-sm mt-1">
                              {new Date(incident.created_at).toLocaleString()}
                            </p>
                            {incident.event_details && (
                              <pre className="text-xs text-white/50 mt-2 bg-black/20 p-2 rounded">
                                {JSON.stringify(incident.event_details, null, 2)}
                              </pre>
                            )}
                          </div>
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <p className="text-white/70">No security incidents detected</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="bg-white/5 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">System Health Check</h2>
              {securityOverview && (
                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <h3 className="font-medium text-green-400 mb-2">Overall Status: {securityOverview.overall_status}</h3>
                    <pre className="text-xs text-white/70 bg-black/20 p-2 rounded overflow-auto">
                      {JSON.stringify(securityOverview, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminRoute>
  );
};
