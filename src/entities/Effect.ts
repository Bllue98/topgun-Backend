import { Column, Entity, Index, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Talent } from './Talent';

@Index('PK__Effect__3213E83F63DC8DA9', ['id'], { unique: true })
@Entity({ name: 'effects' })
export class Effect {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id?: number;

  @Column('nvarchar', { name: 'kind', length: 20 })
  kind?: string;

  @Column('nvarchar', { name: 'duration_type', length: 20 })
  durationType?: string;

  @Column('float', { name: 'duration_amount', nullable: true, precision: 53 })
  durationAmount?: number | null;

  @Column('nvarchar', { name: 'target_statmod', nullable: true, length: 20 })
  targetStatmod?: string | null;

  @Column('nvarchar', { name: 'stat', nullable: true, length: 100 })
  stat?: string | null;

  @Column('nvarchar', { name: 'op', nullable: true, length: 20 })
  op?: string | null;

  @Column('float', { name: 'value_num', nullable: true, precision: 53 })
  valueNum?: number | null;

  @Column('nvarchar', { name: 'value_expr', nullable: true, length: 50 })
  valueExpr?: string | null;

  @Column('nvarchar', { name: 'target_damage', nullable: true, length: 20 })
  targetDamage?: string | null;

  @Column('nvarchar', { name: 'damage_type', nullable: true, length: 100 })
  damageType?: string | null;

  @Column('float', { name: 'amount_num', nullable: true, precision: 53 })
  amountNum?: number | null;

  @Column('nvarchar', { name: 'amount_expr', nullable: true, length: 50 })
  amountExpr?: string | null;

  @Column('nvarchar', { name: 'target_heal', nullable: true, length: 20 })
  targetHeal?: string | null;

  @Column('float', { name: 'heal_num', nullable: true, precision: 53 })
  healNum?: number | null;

  @Column('nvarchar', { name: 'heal_expr', nullable: true, length: 50 })
  healExpr?: string | null;

  @ManyToMany(() => Talent, (talent) => talent.effects)
  talents?: Talent[];
}
