import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200
        p-6 transition-shadow hover:shadow-md
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: "blue" | "green" | "red" | "yellow";
}

const colorClasses = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-green-50 text-green-700",
  red: "bg-red-50 text-red-700",
  yellow: "bg-yellow-50 text-yellow-700",
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color = "blue",
}) => {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-2">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {icon && <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>}
      </div>
    </Card>
  );
};
