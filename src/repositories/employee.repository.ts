import {inject} from '@loopback/core';
import {DefaultCrudRepository, DefaultTransactionalRepository} from '@loopback/repository';
import {PostgresDataSource} from '../datasources';
import {Employee, EmployeeRelations} from '../models';

export class EmployeeRepository extends DefaultTransactionalRepository<
  Employee,
  typeof Employee.prototype.id,
  EmployeeRelations
> {
  constructor(
    @inject('datasources.postgres') dataSource: PostgresDataSource,
  ) {
    super(Employee, dataSource);
  }
}
