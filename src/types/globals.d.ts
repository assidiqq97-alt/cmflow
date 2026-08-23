// Ambient types for Node.js globals in Next.js environment
declare var process: {
  env: Record<string, string | undefined>;
};

declare var Buffer: {
  from(data: any, encoding?: string): {
    toString(encoding?: string): string;
  };
};

declare namespace NodeJS {
  type Timeout = any;
  type Timer = any;
}
