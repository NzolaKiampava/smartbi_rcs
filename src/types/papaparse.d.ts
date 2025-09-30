declare module 'papaparse' {
  interface ParseResult<T> {
    data: T[];
    errors: any[];
    meta: {
      delimiter: string;
      linebreak: string;
      aborted: boolean;
      truncated: boolean;
      cursor: number;
      fields?: string[];
    };
  }

  interface ParseConfig {
    header?: boolean;
    skipEmptyLines?: boolean | 'greedy';
    complete?: (results: ParseResult<any>) => void;
    error?: (err: any) => void;
  }

  export function parse(file: File | string, config?: ParseConfig): void;

  const Papa: {
    parse: typeof parse;
  };

  export default Papa;
}
