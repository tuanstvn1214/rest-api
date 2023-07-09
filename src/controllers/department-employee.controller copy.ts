import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {DepartmentEmployee} from '../models';
import {DepartmentEmployeeRepository} from '../repositories';

export class DepartmentEmployeeController {
  constructor(
    @repository(DepartmentEmployeeRepository)
    public departmentEmployeeRepository : DepartmentEmployeeRepository,
  ) {}


}
