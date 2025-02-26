import { TavilySearchResults } from '@langchain/community/tools/tavily_search';

export const searchTavily: TavilySearchResults = new TavilySearchResults({
  maxResults: 3,
});
