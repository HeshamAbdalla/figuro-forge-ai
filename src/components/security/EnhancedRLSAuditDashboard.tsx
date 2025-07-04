import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Eye,
  AlertCircle,
  PlayCircle,
  StopCircle
} from 'lucide-react';
import { useEnhancedRLSAudit } from '@/hooks/useEnhancedRLSAudit';

interface EnhancedRLSAuditDashboardProps {
  className?: string;
}

/**
 * Enhanced RLS Audit Dashboard Component
 * Displays comprehensive RLS policy audit results with real-time monitoring
 */
export const EnhancedRLSAuditDashboard: React.FC<EnhancedRLSAuditDashboardProps> = ({ 
  className 
}) => {
  const {
    auditResult,
    isLoading,
    error,
    triggerAudit,
    monitoringActive,
    startMonitoring,
    stopMonitoring
  } = useEnhancedRLSAudit();

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSeverityBadge = (severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW') => {
    const variants = {
      'CRITICAL': 'destructive',
      'HIGH': 'destructive',
      'MEDIUM': 'default',
      'LOW': 'secondary'
    } as const;

    return <Badge variant={variants[severity]}>{severity}</Badge>;
  };

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Enhanced RLS Audit Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Audit Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={triggerAudit} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Audit
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Enhanced RLS Security Audit
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={monitoringActive ? stopMonitoring : startMonitoring}
                className="flex items-center gap-1"
              >
                {monitoringActive ? (
                  <>
                    <StopCircle className="h-4 w-4" />
                    Stop Monitoring
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4" />
                    Start Monitoring
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={triggerAudit}
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Run Audit
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        {monitoringActive && (
          <CardContent>
            <Alert>
              <Eye className="h-4 w-4" />
              <AlertTitle>Real-time Monitoring Active</AlertTitle>
              <AlertDescription>
                RLS policies are being monitored automatically every 10 minutes.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {isLoading && !auditResult && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Running comprehensive RLS audit...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {auditResult && (
        <>
          {/* Overall Security Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Overall Security Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    <span className={getScoreColor(auditResult.overallScore)}>
                      {auditResult.overallScore}/100
                    </span>
                  </span>
                  <div className="text-right text-sm text-muted-foreground">
                    Last updated: {new Date(auditResult.timestamp).toLocaleString()}
                  </div>
                </div>
                
                <Progress value={auditResult.overallScore} className="h-3" />
                
                <div className="text-sm text-muted-foreground">
                  {auditResult.summary}
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {auditResult.secureTablesCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Secure Tables</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {auditResult.vulnerableTablesCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Vulnerable Tables</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {auditResult.totalTables}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Tables</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Critical Issues */}
          {auditResult.criticalIssues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Critical Security Issues ({auditResult.criticalIssues.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditResult.criticalIssues.map((issue: any, index: number) => (
                    <Alert key={index} variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="flex items-center justify-between">
                        {issue.table}: {issue.type}
                        {getSeverityBadge(issue.severity)}
                      </AlertTitle>
                      <AlertDescription>
                        <div className="mt-2">
                          <div className="font-medium">Description:</div>
                          <div>{issue.description}</div>
                          <div className="font-medium mt-2">Remediation:</div>
                          <div>{issue.remediation}</div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Table-by-Table Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Table Security Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {auditResult.results.map((result: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{result.table}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${getScoreColor(result.securityScore)}`}>
                          {result.securityScore}/100
                        </span>
                        {result.securityScore >= 80 ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>

                    <Progress value={result.securityScore} className="h-2 mb-4" />

                    {/* Vulnerabilities */}
                    {result.vulnerabilities.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Vulnerabilities:</h4>
                        <div className="space-y-2">
                          {result.vulnerabilities.map((vuln: any, vIndex: number) => (
                            <div key={vIndex} className="flex items-start gap-2 text-sm">
                              {getSeverityBadge(vuln.severity)}
                              <div>
                                <div className="font-medium">{vuln.type}</div>
                                <div className="text-muted-foreground">{vuln.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Test Results */}
                    {result.testResults.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Test Results:</h4>
                        <div className="space-y-1">
                          {result.testResults.map((test: any, tIndex: number) => (
                            <div key={tIndex} className="flex items-center gap-2 text-sm">
                              {test.passed ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span>{test.testCase}</span>
                              {test.error && (
                                <span className="text-red-500">({test.error})</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {result.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Recommendations:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {result.recommendations.map((rec: string, rIndex: number) => (
                            <li key={rIndex}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};