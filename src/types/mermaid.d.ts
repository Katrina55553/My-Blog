declare namespace mermaid {
  function initialize(config: Record<string, unknown>): void;
  function run(options: { querySelector: string }): Promise<void>;
}
