import { Column, Entity, Index, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Talent } from './Talent';

@Index('PK__Requirem__3213E83FEAB6EC56', ['id'], { unique: true })
@Entity({ name: 'requirements' })
export class Requirement {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id?: number;

  @Column('nvarchar', { name: 'kind', length: 20 })
  kind?: string;

  @Column('int', { name: 'min_level', nullable: true })
  minLevel?: number | null;

  @Column('nvarchar', { name: 'stat', nullable: true, length: 100 })
  stat?: string | null;

  @Column('float', { name: 'min_value', nullable: true, precision: 53 })
  minValue?: number | null;

  @Column('nvarchar', { name: 'talent_ref_id', nullable: true, length: 200 })
  talentRefId?: string | null;

  @Column('nvarchar', { name: 'tag', nullable: true, length: 100 })
  tag?: string | null;

  @Column('int', { name: 'tag_count', nullable: true })
  tagCount?: number | null;

  @Column('nvarchar', { name: 'class_id', nullable: true, length: 200 })
  classId?: string | null;

  @ManyToMany(() => Talent, (talent) => talent.requirements)
  talents?: Talent[];
}
