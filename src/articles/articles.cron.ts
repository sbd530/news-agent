import { Injectable } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ArticlesCron {
  constructor(private readonly articlesService: ArticlesService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async cronFilterByLLM(): Promise<void> {
    await this.articlesService.filterByLLM();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cronCrawlHackerNews(): Promise<void> {
    await this.articlesService.crawlHackerNews();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cronCrawlGeekNews(): Promise<void> {
    await this.articlesService.crawlGeekNews();
  }
}
