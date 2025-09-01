import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Talent } from './Talent';

@Index('idx_requirements_talent', ['talentId'], {})
@Index('PK__requirem__3213E83FFB17820F', ['id'], { unique: true })
@Entity({ name: 'requirements', schema: 'myschema' })
export class Requirement {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id?: number;

  @Column('int', { name: 'talent_id' })
  talentId?: number;

  @Column('varchar', { name: 'kind', length: 20 })
  kind?: string;

  @Column('varchar', { name: 'ref_id', nullable: true, length: 255 })
  refId?: string | null;

  @Column('decimal', {
    name: 'min_value',
    nullable: true,
    precision: 10,
    scale: 2
  })
  minValue?: number | null;

  @Column('varchar', { name: 'stat', nullable: true, length: 255 })
  stat?: string | null;

  @Column('varchar', { name: 'talent_ref_id', nullable: true, length: 255 })
  talentRefId?: string | null;

  @Column('varchar', { name: 'tag', nullable: true, length: 255 })
  tag?: string | null;

  @Column('int', { name: 'tag_count', nullable: true })
  tagCount?: number | null;

  @Column('varchar', { name: 'class_id', nullable: true, length: 255 })
  classId?: string | null;

  @ManyToOne(() => Talent, (talent) => talent.requirements, {
    onDelete: 'CASCADE'
  })
  @JoinColumn([{ name: 'talent_id', referencedColumnName: 'id' }])
  talent?: Talent;
}
