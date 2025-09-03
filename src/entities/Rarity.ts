import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Talent } from "./Talent";

@Index("PK__Rarity__3213E83F07E918BD", ["id"], { unique: true })
@Entity({ name: 'rarities' })
export class Rarity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id?: number;


  @Column("nvarchar", { name: "tier", length: 20 })
  tier?: string;

  @Column("float", { name: "weight", precision: 53, default: () => "(1)" })
  weight?: number;

  @Column("nvarchar", { name: "color", nullable: true, length: 7 })
  color?: string | null;

  @OneToMany(() => Talent, (talent) => talent.rarity)
  talents?: Talent[];
}
