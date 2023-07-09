import { Entity, model, property, referencesMany, hasMany } from '@loopback/repository';
import { Employee } from './employee.model';
import {DepartmentEmployee} from './department-employee.model';

@model({ settings: { strict: false } })
export class Department extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
  })
  code?: string;

  @property({
    type: 'string',
  })
  name?: string;

  @hasMany(() => Employee, {through: {model: () => DepartmentEmployee}})
  employees: Employee[];
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Department>) {
    super(data);
  }
}

export interface DepartmentRelations {
  // describe navigational properties here
}

export type DepartmentWithRelations = Department & DepartmentRelations;
