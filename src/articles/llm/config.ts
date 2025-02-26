import { Annotation } from '@langchain/langgraph';
import { RunnableConfig } from '@langchain/core/runnables';

export const SYSTEM_PROMPT_TEMPLATE = `
You are a helpful AI assistant.
`;

export const ConfigurationSchema = Annotation.Root({
  systemPromptTemplate: Annotation<string>,

  model: Annotation<string>,
});

export function ensureConfiguration(
  config: RunnableConfig,
): typeof ConfigurationSchema.State {
  /**
   * Ensure the defaults are populated.
   */
  const configurable = config.configurable ?? {};
  return {
    systemPromptTemplate:
      configurable.systemPromptTemplate ?? SYSTEM_PROMPT_TEMPLATE,
    model: configurable.model ?? 'openai/gpt-4o',
  };
}
