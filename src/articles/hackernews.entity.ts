import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class HackerNews {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  articleId: number;

  @Column()
  title: string;

  @Column()
  url?: string;

  @Column()
  checked: boolean = false;

  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ nullable: false })
  updatedAt: Date;
}
