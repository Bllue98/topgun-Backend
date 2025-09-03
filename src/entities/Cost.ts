import { Column, Entity, PrimaryGeneratedColumn, Index, ManyToMany } from 'typeorm';
import { Talent } from './Talent';

@Index('PK__Cost__3213E83F0577CEB4', ['id'], { unique: true })
@Entity({ name: 'costs' })
export class Cost {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id?: number;

  @Column('nvarchar', { name: 'kind', length: 20 })
  kind?: string;

  @Column('nvarchar', { name: 'resource', length: 20 })
  resource?: string;

  @Column('float', { name: 'amount', nullable: true, precision: 53 })
  amount?: number | null;

  @Column('int', { name: 'max_uses', nullable: true })
  maxUses?: number | null;

  @ManyToMany(() => Talent, (talent) => talent.costs)
  talents?: Talent[];
}
