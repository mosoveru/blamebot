import { Entity, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'object_types',
})
export class ObjectType {
  @PrimaryColumn({ enum: ['issue', 'request'], enumName: 'GitObjectTypes' })
  objectType: string;
}
