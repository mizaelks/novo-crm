
export const getColorClass = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    green: 'border-green-200 bg-green-50 text-green-700',
    purple: 'border-purple-200 bg-purple-50 text-purple-700',
    orange: 'border-orange-200 bg-orange-50 text-orange-700',
    yellow: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    gray: 'border-gray-200 bg-gray-50 text-gray-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700'
  };
  return colorMap[color] || 'border-gray-200 bg-gray-50 text-gray-700';
};
