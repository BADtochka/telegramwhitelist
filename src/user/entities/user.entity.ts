import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn()
  telegramId: number;

  @Column({ nullable: true, unique: true })
  minecraftName: string;
}
