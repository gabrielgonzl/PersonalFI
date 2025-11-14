import { useCallback } from 'react';
import { format } from 'date-fns';

/**
 * useExportCSV Hook
 * Provides functionality to export data to CSV format
 *
 * @returns {function} exportToCSV function
 *
 * @example
 * const exportToCSV = useExportCSV();
 *
 * exportToCSV({
 *   data: portfolios,
 *   filename: 'portfolios',
 *   headers: ['Name', 'Balance', 'Assets'],
 *   fields: ['name', 'balance', 'assets']
 * });
 */
export const useExportCSV = () => {
  const convertToCSV = useCallback((data, headers, fields) => {
    if (!data || data.length === 0) return '';

    // Create header row
    const headerRow = headers.join(',');

    // Create data rows
    const dataRows = data.map((item) => {
      return fields
        .map((field) => {
          // Handle nested fields (e.g., 'user.name')
          const value = field.split('.').reduce((obj, key) => obj?.[key], item);

          // Handle different data types
          if (value === null || value === undefined) {
            return '';
          }

          if (typeof value === 'string') {
            // Escape quotes and wrap in quotes if contains comma or newline
            const escaped = value.replace(/"/g, '""');
            return value.includes(',') || value.includes('\n') ? `"${escaped}"` : escaped;
          }

          if (Array.isArray(value)) {
            return `"${value.join('; ')}"`;
          }

          if (typeof value === 'object') {
            return `"${JSON.stringify(value)}"`;
          }

          return value;
        })
        .join(',');
    });

    return [headerRow, ...dataRows].join('\n');
  }, []);

  const exportToCSV = useCallback(
    ({ data, filename, headers, fields }) => {
      try {
        // Validate inputs
        if (!data || !Array.isArray(data) || data.length === 0) {
          throw new Error('No data to export');
        }

        if (!headers || !fields || headers.length !== fields.length) {
          throw new Error('Headers and fields must have the same length');
        }

        // Convert to CSV
        const csv = convertToCSV(data, headers, fields);

        // Create blob
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

        // Create download link
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        // Format filename with timestamp
        const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
        const finalFilename = `${filename}_${timestamp}.csv`;

        link.setAttribute('href', url);
        link.setAttribute('download', finalFilename);
        link.style.visibility = 'hidden';

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup
        URL.revokeObjectURL(url);

        return { success: true, filename: finalFilename };
      } catch (error) {
        console.error('CSV Export Error:', error);
        return { success: false, error: error.message };
      }
    },
    [convertToCSV]
  );

  return exportToCSV;
};

export default useExportCSV;
