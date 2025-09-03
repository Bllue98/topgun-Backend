// import { Column, Entity, Index, ManyToMany } from "typeorm";
// import { Talent } from "./Talent";

// @Index("PK__Cost__3213E83F52FB61A2", ["id"], { unique: true })
// @Entity("Cost")
// export class Cost {
//   @Column("uniqueidentifier", {
//     primary: true,
//     name: "id",
//     default: () => "newid()",
//   })
//   id?: string;

//   @Column("nvarchar", { name: "kind", length: 20 })
//   kind?: string;

//   @Column("nvarchar", { name: "resource", length: 20 })
//   resource?: string;

//   @Column("float", { name: "amount", nullable: true, precision: 53 })
//   amount?: number | null;

//   @Column("int", { name: "maxUses", nullable: true })
//   maxUses?: number | null;

//   @ManyToMany(() => Talent, (talent) => talent.costs)
//   talents?: Talent[];
// }
