import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesService } from './articles.service';
import { HackerNews } from './hackernews.entity';
import { ArticlesController } from './articles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HackerNews])],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
