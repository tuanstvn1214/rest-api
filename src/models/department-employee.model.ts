import {Entity, model, property} from '@loopback/repository';

@model({name:'department_employee'})
export class DepartmentEmployee extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;
  @property({
    name: 'department_id',
    type: 'number',
  })
  departmentId?: number;

  @property({
    name: 'employee_id',
    type: 'number',
  })
  employeeId?: number;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<DepartmentEmployee>) {
    super(data);
  }
}

export interface DepartmentEmployeeRelations {
  // describe navigational properties here
}

export type DepartmentEmployeeWithRelations = DepartmentEmployee & DepartmentEmployeeRelations;
