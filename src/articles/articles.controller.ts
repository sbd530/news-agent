import { Controller, Post } from '@nestjs/common';
import { ArticlesService } from './articles.service';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post('hacker-news/filter')
  async filterByLLM() {
    return await this.articlesService.filterByLLM();
  }

  @Post('hacker-news/crawl')
  async crawlHackerNews() {
    return this.articlesService.crawlHackerNews();
  }
}
