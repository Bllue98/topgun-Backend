// import { Column, Entity, Index, OneToMany } from 'typeorm';
// import { Talent } from './Talent';

// @Index('PK__Rarity__3213E83FB01E97A6', ['id'], { unique: true })
// @Entity('Rarity')
// export class Rarity {
//   @Column('uniqueidentifier', {
//     primary: true,
//     name: 'id',
//     default: () => 'newid()'
//   })
//   id?: string;

//   @Column('nvarchar', { name: 'tier', length: 20 })
//   tier?: string;

//   @Column('float', { name: 'weight', precision: 53, default: () => '(1)' })
//   weight?: number;

//   @Column('nvarchar', { name: 'color', nullable: true, length: 7 })
//   color?: string | null;

//   @OneToMany(() => Talent, (talent) => talent.rarity)
//   talents?: Talent[];
// }
