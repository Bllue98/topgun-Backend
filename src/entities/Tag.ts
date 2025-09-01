import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Talent } from './Talent';

@Index('idx_tags_talent', ['talentId'], {})
@Index('PK__talent_t__C1013DA9A046118C', ['talentId', 'tag'], { unique: true })
@Entity('talent_tags')
export class Tag {
  @Column('int', { primary: true, name: 'talent_id' })
  talentId?: number;

  @Column('varchar', { primary: true, name: 'tag', length: 255 })
  tag?: string;

  @ManyToOne(() => Talent, (talent) => talent.talentTags, {
    onDelete: 'CASCADE'
  })
  @JoinColumn([{ name: 'talent_id', referencedColumnName: 'id' }])
  talent?: Talent;
}
