import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PostgresDataSource} from '../datasources';
import {DepartmentEmployee, DepartmentEmployeeRelations} from '../models';

export class DepartmentEmployeeRepository extends DefaultCrudRepository<
  DepartmentEmployee,
  typeof DepartmentEmployee.prototype.id,
  DepartmentEmployeeRelations
> {
  constructor(
    @inject('datasources.postgres') dataSource: PostgresDataSource,
  ) {
    super(DepartmentEmployee, dataSource);
  }
}
