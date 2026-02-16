import React from 'react';

/**
 * AdminTable
 * Reusable table wrapper used by admin pages (verifications, refunds, ...)
 * - columns: [{ label, className? }]
 * - children: <tr/> rows
 */
const AdminTable = ({ columns = [], children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="bg-gray-50 border-b sticky top-0 z-10">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className={`px-4 py-3 text-left text-xs font-semibold ${col.className || ''}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">{children}</tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTable;
