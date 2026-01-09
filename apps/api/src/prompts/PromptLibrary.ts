export interface PromptTemplate {
  key: string;
  version: number;
  name: string;
  description: string;
  template: string;
}

export class PromptLibrary {
  private static prompts: Map<string, PromptTemplate> = new Map();

  static register(prompt: PromptTemplate) {
    const key = `${prompt.key}.v${prompt.version}`;
    this.prompts.set(key, prompt);
  }

  static get(key: string, version?: number): PromptTemplate | undefined {
    if (version) {
      return this.prompts.get(`${key}.v${version}`);
    }

    // Get latest version
    const matching = Array.from(this.prompts.values())
      .filter(p => p.key === key)
      .sort((a, b) => b.version - a.version);

    return matching[0];
  }

  static render(key: string, variables: Record<string, any>, version?: number): string {
    const prompt = this.get(key, version);
    if (!prompt) {
      throw new Error(`Prompt not found: ${key}`);
    }

    let rendered = prompt.template;
    for (const [varKey, value] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`{{${varKey}}}`, 'g'), String(value));
    }

    return rendered;
  }
}
