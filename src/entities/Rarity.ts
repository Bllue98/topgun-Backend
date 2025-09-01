import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Talent } from './Talent';

@Index('PK__rarities__3213E83F07C6FF1E', ['id'], { unique: true })
@Entity('rarities')
export class Rarity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id?: number;

  @Column('varchar', { name: 'tier', length: 20, default: () => "'common'" })
  tier?: string;

  @Column('decimal', {
    name: 'weight',
    precision: 10,
    scale: 2,
    default: () => '(1)'
  })
  weight?: number;

  @Column('char', { name: 'color', nullable: true, length: 7 })
  color?: string | null;

  @OneToMany(() => Talent, (talent) => talent.rarity)
  talents?: Talent[];
}
