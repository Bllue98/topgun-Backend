// import {
//   Column,
//   Entity,
//   Index,
//   JoinColumn,
//   JoinTable,
//   ManyToMany,
//   ManyToOne,
// } from "typeorm";
// import { Rarity } from "./Rarity";
// import { Cost } from "./Cost";
// import { Effect } from "./Effect";
// import { Requirement } from "./Requirement";
// import { Tag } from "./Tag";

// @Index("IX_Talent_Rarity", ["rarityId"], {})
// @Index("PK__Talent__3213E83F317D3EC3", ["id"], { unique: true })
// @Entity("Talent")
// export class Talent {
//   @Column("uniqueidentifier", {
//     primary: true,
//     name: "id",
//     default: () => "newid()",
//   })
//   id?: string;

//   @Column("nvarchar", { name: "name", length: 200 })
//   name?: string;

//   @Column("nvarchar", { name: "description", nullable: true })
//   description?: string | null;

//   @Column("datetime2", { name: "createdAt", default: () => "sysutcdatetime()" })
//   createdAt?: Date;

//   @Column("datetime2", { name: "updatedAt", default: () => "sysutcdatetime()" })
//   updatedAt?: Date;

//   @Column("bit", { name: "isKeyTalent", default: () => "(0)" })
//   isKeyTalent?: boolean;

//   @Column("nvarchar", { name: "category", nullable: true, length: 100 })
//   category?: string | null;

//   @Column("int", { name: "cooldown", default: () => "(0)" })
//   cooldown?: number;

//   @Column("int", { name: "rank", default: () => "(1)" })
//   rank?: number;

//   @Column("int", { name: "maxRank", default: () => "(1)" })
//   maxRank?: number;

//   @Column("uniqueidentifier", { name: "rarityId", nullable: true })
//   rarityId?: string | null;

//   @ManyToOne(() => Rarity, (rarity) => rarity.talents)
//   @JoinColumn([{ name: "rarityId", referencedColumnName: "id" }])
//   rarity?: Rarity;

//   @ManyToMany(() => Cost, (cost) => cost.talents)
//   @JoinTable({
//     name: "TalentCost",
//     joinColumns: [{ name: "talentId", referencedColumnName: "id" }],
//     inverseJoinColumns: [{ name: "costId", referencedColumnName: "id" }],
//     schema: "dbo",
//   })
//   costs?: Cost[];

//   @ManyToMany(() => Effect, (effect) => effect.talents)
//   effects?: Effect[];

//   @ManyToMany(() => Requirement, (requirement) => requirement.talents)
//   @JoinTable({
//     name: "TalentRequirement",
//     joinColumns: [{ name: "talentId", referencedColumnName: "id" }],
//     inverseJoinColumns: [{ name: "requirementId", referencedColumnName: "id" }],
//     schema: "dbo",
//   })
//   requirements?: Requirement[];

//   @ManyToMany(() => Tag, (tag) => tag.talents)
//   @JoinTable({
//     name: "TalentTag",
//     joinColumns: [{ name: "talentId", referencedColumnName: "id" }],
//     inverseJoinColumns: [{ name: "tagId", referencedColumnName: "id" }],
//     schema: "dbo",
//   })
//   tags?: Tag[];
// }
