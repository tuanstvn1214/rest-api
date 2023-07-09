import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {
  Department,
  DepartmentEmployee,
  Employee,
} from '../models';
import { DepartmentEmployeeRepository, DepartmentRepository } from '../repositories';

export class DepartmentEmployeeController {
  constructor(
    @repository(DepartmentRepository) protected departmentRepository: DepartmentRepository,
    @repository(DepartmentEmployeeRepository) protected departmentEmployeeRepository: DepartmentEmployeeRepository,
  ) { }
  @post('/department-employees')
  @response(200, {
    description: 'DepartmentEmployee model instance',
    content: { 'application/json': { schema: getModelSchemaRef(DepartmentEmployee) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(DepartmentEmployee, {
            title: 'NewDepartmentEmployee',
            exclude: ['id'],
          }),
        },
      },
    })
    departmentEmployee: Omit<DepartmentEmployee, 'id'>,
  ): Promise<DepartmentEmployee> {
    return this.departmentEmployeeRepository.create(departmentEmployee);
  }

  @get('/department-employees/count')
  @response(200, {
    description: 'DepartmentEmployee model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(
    @param.where(DepartmentEmployee) where?: Where<DepartmentEmployee>,
  ): Promise<Count> {
    return this.departmentEmployeeRepository.count(where);
  }

  @get('/department-employees')
  @response(200, {
    description: 'Array of DepartmentEmployee model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(DepartmentEmployee, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(DepartmentEmployee) filter?: Filter<DepartmentEmployee>,
  ): Promise<DepartmentEmployee[]> {
    return this.departmentEmployeeRepository.find(filter);
  }

  @patch('/department-employees')
  @response(200, {
    description: 'DepartmentEmployee PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(DepartmentEmployee, { partial: true }),
        },
      },
    })
    departmentEmployee: DepartmentEmployee,
    @param.where(DepartmentEmployee) where?: Where<DepartmentEmployee>,
  ): Promise<Count> {
    return this.departmentEmployeeRepository.updateAll(departmentEmployee, where);
  }

  @get('/department-employees/{id}')
  @response(200, {
    description: 'DepartmentEmployee model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(DepartmentEmployee, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(DepartmentEmployee, { exclude: 'where' }) filter?: FilterExcludingWhere<DepartmentEmployee>
  ): Promise<DepartmentEmployee> {
    return this.departmentEmployeeRepository.findById(id, filter);
  }

  @patch('/department-employees/{id}')
  @response(204, {
    description: 'DepartmentEmployee PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(DepartmentEmployee, { partial: true }),
        },
      },
    })
    departmentEmployee: DepartmentEmployee,
  ): Promise<void> {
    await this.departmentEmployeeRepository.updateById(id, departmentEmployee);
  }

  @put('/department-employees/{id}')
  @response(204, {
    description: 'DepartmentEmployee PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() departmentEmployee: DepartmentEmployee,
  ): Promise<void> {
    await this.departmentEmployeeRepository.replaceById(id, departmentEmployee);
  }

  @del('/department-employees/{id}')
  @response(204, {
    description: 'DepartmentEmployee DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.departmentEmployeeRepository.deleteById(id);
  }
  @get('/departments/{id}/employees', {
    responses: {
      '200': {
        description: 'Array of Department has many Employee through DepartmentEmployee',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(Employee) },
          },
        },
      },
    },
  })
  async findByEmployee(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Employee>,
  ): Promise<Employee[]> {
    return this.departmentRepository.employees(id).find(filter);
  }

  @post('/departments/{id}/employees', {
    responses: {
      '200': {
        description: 'create a Employee model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Employee) } },
      },
    },
  })
  async createByEmployee(
    @param.path.number('id') id: typeof Department.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Employee, {
            title: 'NewEmployeeInDepartment',
            exclude: ['id'],
          }),
        },
      },
    }) employee: Omit<Employee, 'id'>,
  ): Promise<Employee> {
    return this.departmentRepository.employees(id).create(employee);
  }

  @patch('/departments/{id}/employees', {
    responses: {
      '200': {
        description: 'Department.Employee PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async patchByEmployee(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Employee, { partial: true }),
        },
      },
    })
    employee: Partial<Employee>,
    @param.query.object('where', getWhereSchemaFor(Employee)) where?: Where<Employee>,
  ): Promise<Count> {
    return this.departmentRepository.employees(id).patch(employee, where);
  }

  @del('/departments/{id}/employees', {
    responses: {
      '200': {
        description: 'Department.Employee DELETE success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async deleteByEmployee(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Employee)) where?: Where<Employee>,
  ): Promise<Count> {
    return this.departmentRepository.employees(id).delete(where);
  }
}
