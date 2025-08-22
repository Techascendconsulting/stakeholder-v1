import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Activity } from 'lucide-react';
import { systemValidator, SystemHealth } from '../../utils/systemValidator';
import { errorHandler } from '../../utils/errorHandling';

interface SystemHealthCheckProps {
  isOpen: boolean;
  onClose: () => void;
}

const SystemHealthCheck: React.FC<SystemHealthCheckProps> = ({ isOpen, onClose }) => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const runHealthCheck = async () => {
    setIsLoading(true);
    try {
      const result = await systemValidator.validateSystem();
      setHealth(result);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
      setHealth({
        overall: 'unhealthy',
        components: [],
        timestamp: new Date().toISOString(),
        recommendations: ['Health check itself failed. Please restart the application.']
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runHealthCheck();
    }
  }, [isOpen]);

  const getStatusIcon = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getOverallStatusColor = (overall: string) => {
    switch (overall) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'unhealthy':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getOverallStatusIcon = (overall: string) => {
    switch (overall) {
      case 'healthy':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Activity className="w-6 h-6 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Activity className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">System Health Check</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Overall Status */}
          {health && (
            <div className={`mb-6 p-4 rounded-lg border ${getOverallStatusColor(health.overall)}`}>
              <div className="flex items-center space-x-3">
                {getOverallStatusIcon(health.overall)}
                <div>
                  <h3 className="font-semibold capitalize">
                    System Status: {health.overall}
                  </h3>
                  <p className="text-sm opacity-75">
                    Last checked: {lastCheck?.toLocaleTimeString() || 'Never'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Refresh Button */}
          <div className="mb-6">
            <button
              onClick={runHealthCheck}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Checking...' : 'Refresh Health Check'}</span>
            </button>
          </div>

          {/* Component Status */}
          {health && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Component Status</h3>
              {health.components.map((component, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(component.status)}
                    <div>
                      <h4 className="font-medium text-gray-900">{component.component}</h4>
                      <p className="text-sm text-gray-600">{component.message}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      component.status === 'pass' ? 'bg-green-100 text-green-800' :
                      component.status === 'fail' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {component.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {health && health.recommendations.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Recommendations</h3>
              <div className="space-y-2">
                {health.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Handler Status */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Error Handler Status</h3>
            <div className="text-sm text-gray-600">
              {(() => {
                const status = errorHandler.getHealthStatus();
                return (
                  <div className="space-y-1">
                    <p>Error Count (last minute): {status.errorCount}</p>
                    <p>Status: {status.healthy ? 'Healthy' : 'High Error Rate'}</p>
                    <p>Last Error: {status.lastErrorTime ? new Date(status.lastErrorTime).toLocaleTimeString() : 'None'}</p>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-gray-600">Running system health check...</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthCheck;
