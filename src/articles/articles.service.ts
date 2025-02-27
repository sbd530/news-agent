import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { HackerNews } from './hackernews.entity';
import axios from 'axios';
import { hackerNewsGraph } from './llm/hackernews.graph';
import { XMLParser } from 'fast-xml-parser';
import { GeekNews } from './geeknews.entity';

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(
    @InjectRepository(HackerNews)
    private hackerNewsRepository: Repository<HackerNews>,
    @InjectRepository(GeekNews)
    private geekNewsRepository: Repository<GeekNews>,
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

    const { data: articleIds } = await axios.get<number[]>(
      'https://hacker-news.firebaseio.com/v0/newstories.json',
    );

    if (!articleIds || articleIds.length === 0) {
      this.logger.warn('No articles found.');
      return;
    }

    const existingArticles = await this.hackerNewsRepository.find({
      select: ['articleId'],
      where: { articleId: In(articleIds) },
    });

    const existingArticleIds = new Set(
      existingArticles.map((a) => a.articleId),
    );

    const newArticleIds = articleIds
      .filter((id) => !existingArticleIds.has(id))
      .slice(0, 20);

    if (newArticleIds.length === 0) {
      this.logger.log('No new articles to insert.');
      return;
    }

    this.logger.log(`Found ${newArticleIds.length} new articles.`);

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

  async crawlGeekNews(): Promise<void> {
    const urls = await this.fetchRssEntryIds();

    const existingArticles = await this.geekNewsRepository.find({
      where: { url: In(urls) },
    });

    const existingUrls = new Set(existingArticles.map((a) => a.url));

    const newUrls = urls.filter((id) => !existingUrls.has(id)).slice(0, 5);

    if (newUrls.length === 0) {
      this.logger.log('No new url to insert.');
      return;
    }

    this.logger.log(`Found ${newUrls.length} new articles.`);

    const geekNewsList = newUrls.map((url) =>
      this.geekNewsRepository.create({ url }),
    );
    await this.geekNewsRepository.save(geekNewsList);

    for (const url of newUrls) {
      this.logger.log(`Send URL ${url}`);
      const discordWebhookUrl =
        'https://discord.com/api/webhooks/1344563892172357642/kdZMXTlWnqFALLxkkBdfUODfZNFp7oMwc-z6EGbNbzeqBfs05Z_xkwCiRolv9F7XYzby';
      await axios.post(discordWebhookUrl, { content: url });
    }
  }

  async fetchRssEntryIds(): Promise<string[]> {
    try {
      const { data: xmlData } = await axios.get<string>(
        'https://news.hada.io/rss/news',
      );

      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
      });

      const xml = parser.parse(xmlData) as {
        feed?: { entry?: { id: string }[] };
      };

      return xml.feed?.entry?.map((entry) => entry.id) || [];
    } catch (error) {
      console.error('Error fetching RSS feed:', error);
      return [];
    }
  }
}
