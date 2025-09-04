// import { Column, Entity, Index, ManyToMany } from "typeorm";
// import { Talent } from "./Talent";

// @Index("PK__Tag__3213E83F1740BAAA", ["id"], { unique: true })
// @Index("UQ__Tag__DC101C01ACD8BF5A", ["tag"], { unique: true })
// @Entity("Tag")
// export class Tag {
//   @Column("uniqueidentifier", {
//     primary: true,
//     name: "id",
//     default: () => "newid()",
//   })
//   id?: string;

//   @Column("nvarchar", { name: "tag", unique: true, length: 100 })
//   tag?: string;

//   @ManyToMany(() => Talent, (talent) => talent.tags)
//   talents?: Talent[];
// }
