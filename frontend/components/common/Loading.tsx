import React from "react";

export const Loading: React.FC<{ message?: string }> = ({
  message = "Loading...",
}) => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

interface ErrorProps {
  message: string;
  onDismiss?: () => void;
}

export const Error: React.FC<ErrorProps> = ({ message, onDismiss }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-red-900 mb-1">Error</h3>
          <p className="text-red-700">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600 text-2xl leading-none"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export const EmptyState: React.FC<{
  title: string;
  message: string;
  icon?: React.ReactNode;
}> = ({ title, message, icon }) => {
  return (
    <div className="text-center py-12">
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{message}</p>
    </div>
  );
};
