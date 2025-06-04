import { Entity, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'object_types',
})
export class ObjectType {
  @PrimaryColumn()
  objectType: string;
}
