import { useState, useEffect, useCallback } from 'react';
import { EnhancedRLSAudit } from '@/utils/enhancedRLSAudit';
import { logError } from '@/utils/productionLogger';

interface UseEnhancedRLSAuditReturn {
  auditResult: any | null;
  isLoading: boolean;
  error: string | null;
  triggerAudit: () => Promise<void>;
  monitoringActive: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
}

/**
 * Enhanced RLS Audit Hook
 * Provides React integration for the enhanced RLS audit system
 */
export const useEnhancedRLSAudit = (): UseEnhancedRLSAuditReturn => {
  const [auditResult, setAuditResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monitoringActive, setMonitoringActive] = useState(false);
  const [monitoringInterval, setMonitoringInterval] = useState<NodeJS.Timeout | null>(null);

  /**
   * Trigger a comprehensive RLS audit
   */
  const triggerAudit = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Starting enhanced RLS audit...');
      const result = await EnhancedRLSAudit.performComprehensiveAudit();
      setAuditResult(result);
      
      console.log('✅ Enhanced RLS audit completed', {
        overallScore: result.overallScore,
        criticalIssues: result.criticalIssues.length,
        totalTables: result.totalTables
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      logError('Enhanced RLS audit failed', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Start real-time RLS monitoring
   */
  const startMonitoring = useCallback(() => {
    if (monitoringActive) return;
    
    setMonitoringActive(true);
    
    // Initial audit
    triggerAudit();
    
    // Set up periodic audits every 10 minutes
    const interval = setInterval(() => {
      triggerAudit();
    }, 10 * 60 * 1000);
    
    setMonitoringInterval(interval);
    
    console.log('🔍 Enhanced RLS monitoring started');
  }, [monitoringActive, triggerAudit]);

  /**
   * Stop real-time RLS monitoring
   */
  const stopMonitoring = useCallback(() => {
    if (!monitoringActive) return;
    
    setMonitoringActive(false);
    
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      setMonitoringInterval(null);
    }
    
    console.log('⏹️ Enhanced RLS monitoring stopped');
  }, [monitoringActive, monitoringInterval]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
      }
    };
  }, [monitoringInterval]);

  /**
   * Auto-start monitoring for critical tables
   */
  useEffect(() => {
    // Auto-trigger initial audit on mount
    triggerAudit();
  }, [triggerAudit]);

  return {
    auditResult,
    isLoading,
    error,
    triggerAudit,
    monitoringActive,
    startMonitoring,
    stopMonitoring
  };
};

/**
 * Hook for auditing a specific table
 */
export const useTableRLSAudit = (tableName: string) => {
  const [tableAudit, setTableAudit] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auditTable = useCallback(async () => {
    if (!tableName) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await EnhancedRLSAudit.auditTablePolicies(tableName);
      setTableAudit(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      logError(`Table RLS audit failed for ${tableName}`, err);
    } finally {
      setIsLoading(false);
    }
  }, [tableName]);

  useEffect(() => {
    auditTable();
  }, [auditTable]);

  return {
    tableAudit,
    isLoading,
    error,
    auditTable
  };
};