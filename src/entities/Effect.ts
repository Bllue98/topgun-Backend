import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Talent } from './Talent';

@Index('idx_effects_talent', ['talentId'], {})
@Index('PK__effects__3213E83F14B698BF', ['id'], { unique: true })
@Entity('effects')
export class Effect {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id?: number;

  @Column('int', { name: 'talent_id' })
  talentId?: number;

  @Column('varchar', { name: 'kind', length: 20 })
  kind?: string;

  @Column('varchar', { name: 'target', length: 20 })
  target?: string;

  @Column('varchar', { name: 'stat', nullable: true, length: 255 })
  stat?: string | null;

  @Column('varchar', { name: 'op', nullable: true, length: 10 })
  op?: string | null;

  @Column('varchar', { name: 'value', nullable: true, length: 50 })
  value?: string | null;

  @Column('varchar', { name: 'damage_type', nullable: true, length: 255 })
  damageType?: string | null;

  @Column('varchar', { name: 'amount', nullable: true, length: 50 })
  amount?: string | null;

  @Column('varchar', {
    name: 'duration_type',
    length: 20,
    default: () => "'instant'"
  })
  durationType?: string;

  @Column('decimal', {
    name: 'duration_amount',
    nullable: true,
    precision: 10,
    scale: 2
  })
  durationAmount?: number | null;

  @ManyToOne(() => Talent, (talent) => talent.effects, {
    onDelete: 'CASCADE'
  })
  @JoinColumn([{ name: 'talent_id', referencedColumnName: 'id' }])
  talent?: Talent;
}
