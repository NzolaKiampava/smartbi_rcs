import React from 'react';

interface InsightSummaryProps {
  headers: string[];
  rows: Record<string, string>[];
}

const InsightSummary: React.FC<InsightSummaryProps> = ({ headers, rows }) => {
  // Very small heuristic summary (MVP)
  const rowCount = rows.length;
  const colCount = headers.length;

  const sampleNumericCols = headers.filter(h => {
    const v = rows[0]?.[h];
    return v !== undefined && !isNaN(Number(String(v).replace(/,/g, '')));
  }).slice(0, 3);

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
      <h4 className="font-semibold mb-2">Instant Insight</h4>
      <p className="text-sm text-gray-600 dark:text-gray-300">Detected {colCount} columns and {rowCount} rows.</p>
      {sampleNumericCols.length > 0 && (
        <div className="mt-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">Numeric columns: {sampleNumericCols.join(', ')}</p>
        </div>
      )}
    </div>
  );
};

export default InsightSummary;
