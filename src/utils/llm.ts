export type LLMResult = { text: string };

const LLM_ENDPOINT = import.meta.env.VITE_LLM_ENDPOINT || '';
const LLM_KEY = import.meta.env.VITE_LLM_API_KEY || '';

export async function summarizeDataset(headers: string[], rows: Record<string, any>[]): Promise<LLMResult> {
  // If an external LLM endpoint is provided, call it
  if (LLM_ENDPOINT) {
    try {
      const resp = await fetch(LLM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(LLM_KEY ? { 'Authorization': `Bearer ${LLM_KEY}` } : {})
        },
        body: JSON.stringify({ headers, sample: rows.slice(0, 20) })
      });
      const data = await resp.json();
      if (data && data.text) return { text: data.text };
    } catch (err) {
      console.error('LLM call failed, falling back to local summary', err);
    }
  }

  // Local fallback: simple heuristic summary
  const cols = headers.length;
  const rowsCount = rows.length;
  const numericCols = headers.filter(h => !isNaN(Number(String(rows[0]?.[h] ?? '')))).slice(0,3);
  const text = `Detected ${cols} columns and ${rowsCount} rows. Numeric columns: ${numericCols.join(', ') || 'none'}.`;
  return { text };
}
