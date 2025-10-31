import React from 'react';
import LoadingButton from './LoadingButton';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  onItemsPerPageChange,
}) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span>Showing</span>
        {itemsPerPage && onItemsPerPageChange ? (
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        ) : null}
        <span>of {totalItems} items</span>
      </div>

      <div className="flex items-center gap-2">
        <LoadingButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="secondary"
          className="px-4 py-2 text-sm"
        >
          Previous
        </LoadingButton>

        <div className="flex gap-1">
          {startPage > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition"
              >
                1
              </button>
              {startPage > 2 && <span className="px-2 text-gray-400">...</span>}
            </>
          )}

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 text-sm rounded transition ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-2 text-gray-400">...</span>}
              <button
                onClick={() => onPageChange(totalPages)}
                className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <LoadingButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="secondary"
          className="px-4 py-2 text-sm"
        >
          Next
        </LoadingButton>
      </div>
    </div>
  );
}

