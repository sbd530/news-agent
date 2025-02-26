import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { ChatOllama } from '@langchain/ollama';
import { z } from 'zod';
import { load } from 'cheerio';

const responseSchema = z.object({
  isAiRelated: z
    .boolean()
    .describe(
      'Whether the document is related to artificial intelligence (true/false)',
    ),
  aiTopicDetected: z
    .string()
    .describe('Key AI-related topics mentioned in the document'),
  keyAiTerms: z
    .string()
    .describe('Specific AI-related keywords found in the document.'),
  reasoning: z
    .string()
    .describe(
      'Explanation of why the document is classified as AI-related or not.',
    ),
});

const llama = new ChatOllama({
  baseUrl: 'http://localhost:11434',
  model: 'llama3.2:3b',
});

const StateAnnotation = Annotation.Root({
  document: Annotation<string>,
  isAiRelated: Annotation<string>,
  aiTopicDetected: Annotation<string>,
  keyAiTerms: Annotation<string>,
  reasoning: Annotation<string>,
});

async function callModel(state: typeof StateAnnotation.State) {
  const modelWithStructure = llama.withStructuredOutput(responseSchema);

  const systemMessage = {
    role: 'system',
    content: `You are an AI document classification assistant. 
    Your task is to determine whether a given document is related to artificial intelligence.`,
  };

  const userMessage = {
    role: 'system',
    content: state.document,
  };

  const messages = [systemMessage, userMessage];

  const structuredOutput = await modelWithStructure.invoke(messages);
  return { ...structuredOutput };
}

function filterHTML(content: string): string {
  // check if content includes html tag
  if (!/<html[\s\S]*>/i.test(content)) {
    return content.trim();
  }
  const html = load(content);
  ['img'].forEach((attr) => {
    html(attr).remove();
  });
  html('img').remove();
  html('meta').remove();
  html('script').remove();
  html('style').remove();
  html('link').remove();
  html('path').remove();
  html('svg').remove();
  return html.text().trim();
}

function filterDocument(state: typeof StateAnnotation.State) {
  return { document: filterHTML(state.document) };
}

// Define the workflow graph
const workflow = new StateGraph(StateAnnotation)
  .addNode('filterDocument', filterDocument)
  .addNode('callModel', callModel)
  .addEdge(START, 'filterDocument')
  .addEdge('filterDocument', 'callModel')
  .addEdge('callModel', END);

export const hackerNewsGraph = workflow.compile();
