import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { HackerNews } from './hackernews.entity';
import axios from 'axios';
import { hackerNewsGraph } from './llm/hackernews.graph';

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(
    @InjectRepository(HackerNews)
    private hackerNewsRepository: Repository<HackerNews>,
  ) {}

  async filterByLLM(): Promise<HackerNews | null> {
    const hackerNews = await this.hackerNewsRepository.findOne({
      where: { checked: false },
      order: { id: 'ASC' },
    });
    if (!hackerNews) {
      this.logger.log('No hackerNews.');
      return null;
    }

    const url = hackerNews.url;
    if (!url) {
      this.logger.warn('No url.');
      await this.checkHackerNews(hackerNews);
      return null;
    }

    this.logger.log(`GET ${url}`);
    let document: string;
    try {
      const response = await axios.get<string>(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      document = response.data;
    } catch (error) {
      this.logger.error('Failed to fetch document', error);
      await this.checkHackerNews(hackerNews);
      return null;
    }

    const graphResponse = await hackerNewsGraph.invoke({
      document: document,
    });
    if (!graphResponse.isAiRelated) {
      this.logger.log('Not related to AI.');
      await this.checkHackerNews(hackerNews);
      return null;
    }

    // Send discord
    this.logger.log(`Send URL ${url}`);
    const discordWebhookUrl =
      'https://discord.com/api/webhooks/1344180063326699640/tvOZk3ztkcbrVaLom0W9xB7DbCeaK-ThroJ1YhcIkEKe6VlGdvDOfjAzbGHkwcXWyCiI';
    await axios.post(discordWebhookUrl, {
      content: url,
    });

    await this.checkHackerNews(hackerNews);
    return hackerNews;
  }

  async checkHackerNews(hackerNews: HackerNews) {
    hackerNews.checked = true;
    await this.hackerNewsRepository.save(hackerNews);
  }

  async crawlHackerNews(): Promise<void> {
    this.logger.log('Crawling Hacker News...');

    // 1. Fetch the list of new article IDs
    const { data: articleIds } = await axios.get<number[]>(
      'https://hacker-news.firebaseio.com/v0/newstories.json',
    );

    if (!articleIds || articleIds.length === 0) {
      this.logger.warn('No articles found.');
      return;
    }

    // 2. Get existing articles from the database
    const existingArticles = await this.hackerNewsRepository.find({
      select: ['articleId'],
      where: { articleId: In(articleIds) },
    });

    const existingArticleIds = new Set(
      existingArticles.map((a) => a.articleId),
    );

    // 3. Filter out already stored articles
    const newArticleIds = articleIds
      .filter((id) => !existingArticleIds.has(id))
      .slice(0, 20);

    if (newArticleIds.length === 0) {
      this.logger.log('No new articles to insert.');
      return;
    }

    this.logger.log(`Found ${newArticleIds.length} new articles.`);

    // 4. Fetch details of new articles and insert into DB
    const newArticles = await Promise.all(
      newArticleIds.map(async (articleId) => {
        const { data: article } = await axios.get<{
          title: string;
          url?: string;
        }>(`https://hacker-news.firebaseio.com/v0/item/${articleId}.json`);

        return this.hackerNewsRepository.create({
          articleId,
          title: article.title || 'Untitled',
          url: article.url,
        });
      }),
    );

    await this.hackerNewsRepository.save(newArticles);
    this.logger.log(`Inserted ${newArticles.length} new articles.`);
  }
}
