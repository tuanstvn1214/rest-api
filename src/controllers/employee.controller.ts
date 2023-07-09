import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where, Transaction,
  DefaultTransactionalRepository,
  IsolationLevel,
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
  HttpErrors,
} from '@loopback/rest';
import { Employee } from '../models';
import { EmployeeRepository } from '../repositories';
import { DEFAULT_EMPLOYEE_CODE } from '../contanst';

export class EmployeeController {
  constructor(
    @repository(EmployeeRepository)
    public employeeRepository: EmployeeRepository,
  ) { }

  @post('/employees')
  @response(200, {
    description: 'Employee model instance',
    content: { 'application/json': { schema: getModelSchemaRef(Employee) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: {}
          //  getModelSchemaRef(Employee, {
          //   partial: true,
          //   title: 'NewEmployee',
          //   exclude: ['id'],
          // }
          // ),
        },
      },
    })
    employee: Omit<Employee, 'id'>,
  ): Promise<Employee> {
    if (employee.code) {
      const isValid = checkEmployeeCodeFormat(employee.code)
      if (!isValid)
        throw new HttpErrors.BadRequest('code not in the right format')
      else {
        const tempEmployee = await this.employeeRepository.findOne({ where: { code: employee.code } });
        if (tempEmployee) {
          throw new HttpErrors.Conflict('employee with provided code exist')
        }
        const newEmployee = await this.employeeRepository.create(employee);
        return newEmployee
      }
    }
    const tx = await this.employeeRepository.beginTransaction(IsolationLevel.SERIALIZABLE)

    const lastEmployee = await this.employeeRepository.findOne({ order: ['id DESC'] }, { transaction: tx })
    console.log('[create employee] lastEmployee: ', lastEmployee);

    const newEmployeeCode = createNewEmployeeCode(lastEmployee)

    console.log(newEmployeeCode);
    const newEmployee = await this.employeeRepository.create({ ...employee, code: newEmployeeCode });
    await tx.commit()
    return newEmployee
  }

  @get('/employees/count')
  @response(200, {
    description: 'Employee model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(
    @param.where(Employee) where?: Where<Employee>,
  ): Promise<Count> {
    return this.employeeRepository.count(where);
  }

  @get('/employees')
  @response(200, {
    description: 'Array of Employee model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Employee, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(Employee) filter?: Filter<Employee>,
  ): Promise<Employee[]> {
    return this.employeeRepository.find(filter);
  }

  @patch('/employees')
  @response(200, {
    description: 'Employee PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Employee, { partial: true }),
        },
      },
    })
    employee: Employee,
    @param.where(Employee) where?: Where<Employee>,
  ): Promise<Count> {
    return this.employeeRepository.updateAll(employee, where);
  }

  @get('/employees/{id}')
  @response(200, {
    description: 'Employee model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Employee, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Employee, { exclude: 'where' }) filter?: FilterExcludingWhere<Employee>
  ): Promise<Employee> {
    return this.employeeRepository.findById(id, filter);
  }

  @patch('/employees/{id}')
  @response(204, {
    description: 'Employee PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Employee, { partial: true }),
        },
      },
    })
    employee: Employee,
  ): Promise<void> {
    await this.employeeRepository.updateById(id, employee);
  }

  @put('/employees/{id}')
  @response(204, {
    description: 'Employee PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() employee: Employee,
  ): Promise<void> {
    await this.employeeRepository.replaceById(id, employee);
  }

  @del('/employees/{id}')
  @response(204, {
    description: 'Employee DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.employeeRepository.deleteById(id);
  }
}
export function checkEmployeeCodeFormat(code: string): boolean {
  const regex1 = /^Emp-\d+$/;
  const regex2 = /^\d+-Emp$/;
  return regex1.test(code) || regex2.test(code);
}
function generateStringWithLeadingZeros(number: number, length: number): string {
  const numberString = number.toString();
  const zerosToFill = length - numberString.length;
  const leadingZeros = '0'.repeat(zerosToFill);
  return leadingZeros + numberString;
}
function createNewEmployeeCode(lastEmployee?: Employee | null) {
  console.log('[new employee] lastEmployee: ', lastEmployee);
  if (lastEmployee && lastEmployee?.code) {
    const splitedCode = lastEmployee.code.split('-')
    const haflHeadCode = splitedCode[0]
    const haflTailCode = splitedCode[1]
    let numberCode = ''
    if (!isNaN(parseInt(haflHeadCode))) {
      numberCode = generateStringWithLeadingZeros(parseInt(haflHeadCode) + 1, haflHeadCode.length)
      return `${numberCode}-${haflTailCode}`
    }
    else {
      numberCode = generateStringWithLeadingZeros(parseInt(haflTailCode) + 1, haflTailCode.length)
      return `${haflHeadCode}-${numberCode}`
    }
  }
  else {
    return DEFAULT_EMPLOYEE_CODE;
  }

}