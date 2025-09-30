import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { parseFile } from '../../utils/csvParser';
import InsightSummary from './InsightSummary';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useGamification } from '../../contexts/GamificationContext';

const InstantInsight: React.FC = () => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { addPoints } = useGamification();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    try {
      const parsed = await parseFile(file);
      setHeaders(parsed.headers);
      setRows(parsed.rows);
      setError(null);

      // heuristics: award points for uploading and exploring
      addPoints(10);
    } catch (err) {
      console.error(err);
      setError('Failed to parse file');
    }
  }, [addPoints]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/csv': ['.csv'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx', '.xls'] } });

  const numericSample = headers.find(h => !isNaN(Number(String(rows[0]?.[h] || '').replace(/,/g, ''))));

  const chartData = rows.slice(0, 50).map((r, idx) => ({ name: String(idx + 1), value: numericSample ? Number(String(r[numericSample]).replace(/,/g, '')) : idx }));

  return (
    <div className="space-y-6">
      <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 text-center ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'} dark:bg-gray-800` }>
        <input {...getInputProps()} />
        <p className="text-gray-700 dark:text-gray-200">Drag & drop a CSV / Excel file here, or click to select</p>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      {rows.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <InsightSummary headers={headers} rows={rows} />
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <h5 className="font-semibold mb-2">Suggestions</h5>
              <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc list-inside">
                <li>Check top 10 values in <strong>{numericSample}</strong></li>
                <li>Compare averages over time (if date column exists)</li>
                <li>Create a trend chart for <strong>{numericSample}</strong></li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2 p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <h5 className="font-semibold mb-2">Quick chart</h5>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-600">No numeric column detected to chart.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstantInsight;
