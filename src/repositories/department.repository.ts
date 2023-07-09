import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, ReferencesManyAccessor, HasManyRepositoryFactory, HasManyThroughRepositoryFactory} from '@loopback/repository';
import {PostgresDataSource} from '../datasources';
import {Department, DepartmentRelations, Employee, DepartmentEmployee} from '../models';
import {EmployeeRepository} from './employee.repository';
import {DepartmentEmployeeRepository} from './department-employee.repository';

export class DepartmentRepository extends DefaultCrudRepository<
  Department,
  typeof Department.prototype.id,
  DepartmentRelations
> {

  public readonly employees: HasManyThroughRepositoryFactory<Employee, typeof Employee.prototype.id,
          DepartmentEmployee,
          typeof Department.prototype.id
        >;

  constructor(
    @inject('datasources.postgres') dataSource: PostgresDataSource, @repository.getter('EmployeeRepository') protected employeeRepositoryGetter: Getter<EmployeeRepository>, @repository.getter('DepartmentEmployeeRepository') protected departmentEmployeeRepositoryGetter: Getter<DepartmentEmployeeRepository>,
  ) {
    super(Department, dataSource);
    this.employees = this.createHasManyThroughRepositoryFactoryFor('employees', employeeRepositoryGetter, departmentEmployeeRepositoryGetter,);
    this.registerInclusionResolver('employees', this.employees.inclusionResolver);
  }
}
