/**
 * Professional Loading States Components
 * Provides consistent loading indicators across the application
 */

import React from 'react';
import { Loader2, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Basic spinner component
export const Spinner = ({ 
  size = 'default', 
  className 
}: { 
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 
      className={cn('animate-spin', sizeClasses[size], className)} 
    />
  );
};

// Full page loading component
export const PageLoader = ({ 
  message = 'Loading...',
  description 
}: { 
  message?: string;
  description?: string;
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <Spinner size="lg" className="mx-auto mb-4 text-orange-600" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{message}</h2>
      {description && (
        <p className="text-gray-600 max-w-md">{description}</p>
      )}
    </div>
  </div>
);

// Card loading skeleton
export const CardSkeleton = ({ 
  rows = 3,
  showAvatar = false,
  className 
}: { 
  rows?: number;
  showAvatar?: boolean;
  className?: string;
}) => (
  <Card className={cn('animate-pulse', className)}>
    <CardContent className="p-6">
      <div className="flex items-start space-x-4">
        {showAvatar && (
          <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
        )}
        <div className="flex-1 space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div 
              key={i}
              className={cn(
                'h-4 bg-gray-200 rounded',
                i === 0 && 'w-3/4',
                i === 1 && 'w-full',
                i === 2 && 'w-1/2',
                i > 2 && 'w-2/3'
              )}
            />
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Table loading skeleton
export const TableSkeleton = ({ 
  rows = 5,
  columns = 4 
}: { 
  rows?: number;
  columns?: number;
}) => (
  <div className="animate-pulse">
    {/* Header */}
    <div className="flex space-x-4 mb-4">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="flex-1 h-6 bg-gray-200 rounded" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4 mb-3">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div 
            key={colIndex} 
            className={cn(
              'h-4 bg-gray-200 rounded',
              colIndex === 0 ? 'flex-1' : 'flex-2'
            )}
          />
        ))}
      </div>
    ))}
  </div>
);

// Button loading state
export const LoadingButton = ({ 
  loading,
  children,
  disabled,
  ...props
}: {
  loading: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  [key: string]: any;
}) => (
  <Button 
    disabled={loading || disabled}
    {...props}
  >
    {loading && <Spinner size="sm" className="mr-2" />}
    {children}
  </Button>
);

// Data loading state with retry
export const DataLoader = ({
  loading,
  error,
  onRetry,
  children,
  emptyMessage = 'No data available',
  errorMessage = 'Failed to load data'
}: {
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  children: React.ReactNode;
  emptyMessage?: string;
  errorMessage?: string;
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4 text-orange-600" />
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <WifiOff className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {errorMessage}
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Empty state component
export const EmptyState = ({
  icon: Icon = Wifi,
  title = 'No data found',
  description,
  action
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <Icon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 mb-4 max-w-md">{description}</p>
      )}
      {action}
    </div>
  </div>
);

// Network status indicator
export const NetworkStatus = ({ 
  isOnline = true 
}: { 
  isOnline?: boolean;
}) => {
  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50">
      <div className="flex items-center justify-center">
        <WifiOff className="w-4 h-4 mr-2" />
        <span className="text-sm">You're offline. Some features may not work.</span>
      </div>
    </div>
  );
};

// Progress bar component
export const ProgressBar = ({ 
  progress,
  className,
  showPercentage = false
}: { 
  progress: number;
  className?: string;
  showPercentage?: boolean;
}) => (
  <div className={cn('w-full', className)}>
    <div className="flex justify-between items-center mb-1">
      {showPercentage && (
        <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
      )}
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-orange-600 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  </div>
);

// Inline loading component
export const InlineLoader = ({ 
  message = 'Loading...',
  size = 'default'
}: { 
  message?: string;
  size?: 'sm' | 'default';
}) => (
  <div className="flex items-center justify-center py-4">
    <Spinner size={size} className="mr-2 text-orange-600" />
    <span className={cn(
      'text-gray-600',
      size === 'sm' ? 'text-sm' : 'text-base'
    )}>
      {message}
    </span>
  </div>
);

export default {
  Spinner,
  PageLoader,
  CardSkeleton,
  TableSkeleton,
  LoadingButton,
  DataLoader,
  EmptyState,
  NetworkStatus,
  ProgressBar,
  InlineLoader
};