import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export const parseFile = async (file: File): Promise<{ headers: string[]; rows: Record<string, string>[] }> => {
  const name = file.name.toLowerCase();
  if (name.endsWith('.csv')) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (res: any) => {
          resolve({ headers: res.meta?.fields || [], rows: res.data as Record<string, string>[] });
        },
        error: (err: any) => reject(err)
      });
    });
  }

  // try XLSX
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });
  const headers = json.length > 0 ? Object.keys(json[0]) : [];
  return { headers, rows: json };
};
