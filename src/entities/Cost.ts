import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Talent } from './Talent';

@Index('idx_costs_talent', ['talentId'], {})
@Index('PK__cost_com__3213E83FC559DE55', ['id'], { unique: true })
@Entity('costs')
export class Cost {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id?: number;

  @Column('int', { name: 'talent_id' })
  talentId?: number;

  @Column('varchar', { name: 'kind', length: 20, default: () => "'resource'" })
  kind?: string;

  @Column('varchar', { name: 'resource', length: 20, default: () => "'none'" })
  resource?: string;

  @Column('decimal', {
    name: 'amount',
    nullable: true,
    precision: 10,
    scale: 2
  })
  amount?: number | null;

  @Column('int', { name: 'max_uses', nullable: true })
  maxUses?: number | null;

  @ManyToOne(() => Talent, (talent) => talent.cost, {
    onDelete: 'CASCADE'
  })
  @JoinColumn([{ name: 'talent_id', referencedColumnName: 'id' }])
  talent?: Talent;
}
