import { Column, Entity, Index, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Talent } from "./Talent";

@Index("PK__Tag__3213E83F431B5711", ["id"], { unique: true })
@Index("UQ__Tag__DC101C0129490877", ["tag"], { unique: true })
@Entity({ name: 'tags' })
export class Tag {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id?: number;


  @Column("nvarchar", { name: "tag", unique: true, length: 100 })
  tag?: string;

  @ManyToMany(() => Talent, (talent) => talent.tags)
  talents?: Talent[];
}
