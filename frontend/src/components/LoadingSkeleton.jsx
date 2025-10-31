import React from 'react';

export function ServiceCardSkeleton() {
  return (
    <div className="p-6 bg-gray-800 shadow-md border border-gray-700 rounded-lg animate-pulse">
      <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-700 rounded w-5/6 mb-4"></div>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-6 bg-gray-700 rounded w-20"></div>
        <div className="h-4 bg-gray-700 rounded w-32"></div>
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-gray-700">
        <div className="h-8 bg-gray-700 rounded w-24"></div>
        <div className="h-10 bg-gray-700 rounded w-24"></div>
      </div>
    </div>
  );
}

export function BookingCardSkeleton() {
  return (
    <div className="p-5 bg-gray-800 shadow-md border border-gray-700 rounded-lg animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="h-6 bg-gray-700 rounded w-3/4"></div>
        <div className="h-6 bg-gray-700 rounded w-20"></div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/3"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
      </div>
      <div className="h-10 bg-gray-700 rounded w-full"></div>
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="p-6 border border-gray-700 rounded-lg animate-pulse">
      <div className="flex items-start justify-between mb-2">
        <div className="h-8 w-8 bg-gray-700 rounded"></div>
        <div className="h-8 bg-gray-700 rounded w-12"></div>
      </div>
      <div className="h-5 bg-gray-700 rounded w-24"></div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div>
        <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
        <div className="h-10 bg-gray-700 rounded w-full"></div>
      </div>
      <div>
        <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
        <div className="h-24 bg-gray-700 rounded w-full"></div>
      </div>
      <div>
        <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
        <div className="h-10 bg-gray-700 rounded w-full"></div>
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-700 rounded w-32"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-700 rounded w-40"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-gray-700 rounded w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-gray-700 rounded w-16"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-700 rounded w-24"></div>
      </td>
    </tr>
  );
}

