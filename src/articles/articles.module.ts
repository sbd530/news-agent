import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesService } from './articles.service';
import { HackerNews } from './hackernews.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HackerNews])],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
