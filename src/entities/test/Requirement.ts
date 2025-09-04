// import { Column, Entity, Index, ManyToMany } from 'typeorm';
// import { Talent } from './Talent';

// @Index('PK__Requirem__3213E83F6AA8FAC0', ['id'], { unique: true })
// @Entity('Requirement')
// export class Requirement {
//   @Column('uniqueidentifier', {
//     primary: true,
//     name: 'id',
//     default: () => 'newid()'
//   })
//   id?: string;

//   @Column('nvarchar', { name: 'kind', length: 20 })
//   kind?: string;

//   @Column('int', { name: 'minLevel', nullable: true })
//   minLevel?: number | null;

//   @Column('nvarchar', { name: 'stat', nullable: true, length: 100 })
//   stat?: string | null;

//   @Column('float', { name: 'minValue', nullable: true, precision: 53 })
//   minValue?: number | null;

//   @Column('nvarchar', { name: 'talentRefId', nullable: true, length: 200 })
//   talentRefId?: string | null;

//   @Column('nvarchar', { name: 'tag', nullable: true, length: 100 })
//   tag?: string | null;

//   @Column('int', { name: 'tagCount', nullable: true })
//   tagCount?: number | null;

//   @Column('nvarchar', { name: 'classId', nullable: true, length: 200 })
//   classId?: string | null;

//   @ManyToMany(() => Talent, (talent) => talent.requirements)
//   talents?: Talent[];
// }
