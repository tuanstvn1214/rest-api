import {inject, service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  IsolationLevel,
  Where,
  repository
} from '@loopback/repository';
import {
  HttpErrors,
  Request,
  Response,
  RestBindings,
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';

import {DEFAULT_EMPLOYEE_CODE} from '../contanst';
import {FILE_UPLOAD_SERVICE} from '../keys';
import {Employee} from '../models';
import {EmployeeRepository} from '../repositories';
import {CloudinaryService} from '../services';
import {File, FileUploadHandler} from '../types';

export class EmployeeController {
  constructor(
    @service(CloudinaryService) private cloudinaryService: CloudinaryService,
    @inject(FILE_UPLOAD_SERVICE) private fileUploadHandler: FileUploadHandler,
    @repository(EmployeeRepository)
    public employeeRepository: EmployeeRepository,
  ) { }
  private static getFilesAndFields(request: any) {
    const uploadedFiles = request.files;
    const mapper = (f: globalThis.Express.Multer.File) => {
      return ({
        buffer: f.buffer,
        fieldname: f.fieldname,
        originalname: f.originalname,
        encoding: f.encoding,
        mimetype: f.mimetype,
        size: f.size,
      });
    }
    let files: File[] = [];
    if (Array.isArray(uploadedFiles)) {
      files = uploadedFiles.map(mapper);
    } else {
      for (const filename in uploadedFiles) {
        files.push(...uploadedFiles[filename].map(mapper));
      }
    }
    return {files, fields: request.body};
  }
  @post('/employees')
  @response(200, {
    description: 'Employee model instance',
    content: {'application/json': {schema: getModelSchemaRef(Employee)}},
  })
  async create(
    @requestBody.file()
    request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<Employee> {
    return new Promise<Employee>((resolve, reject) => {

      this.fileUploadHandler(request, response, async (err: unknown) => {
        try {
          const filesAndFields = EmployeeController.getFilesAndFields(request)
          console.log('filesAndFields', filesAndFields);
          const employee: Omit<Employee, 'id'> = filesAndFields.fields
          console.log('employee', employee);
          const files = filesAndFields.files
          const avatar = files.find((file) => {
            return file.fieldname == 'avatar'
          })
          const avatarUrl = (await this.cloudinaryService.upload(avatar?.buffer)).url
          if (employee.code) {
            const isValid = checkEmployeeCodeFormat(employee.code)
            if (!isValid)
              reject(new HttpErrors.BadRequest('code not in the right format'))
            else {
              const tempEmployee = await this.employeeRepository.findOne({where: {code: employee.code}});
              if (tempEmployee) {
                reject(new HttpErrors.Conflict('employee with provided code exist'))
              }
              const newEmployee = await this.employeeRepository.create({...employee, avatar: avatarUrl});
              resolve(newEmployee)
            }
          }
          const tx = await this.employeeRepository.beginTransaction(IsolationLevel.SERIALIZABLE)
          const lastEmployee = await this.employeeRepository.findOne({order: ['id DESC']}, {transaction: tx})
          const newEmployeeCode = createNewEmployeeCode(lastEmployee)
          console.log(newEmployeeCode);
          const newEmployee = await this.employeeRepository.create({...employee, code: newEmployeeCode, avatar: avatarUrl});
          await tx.commit()
          resolve(newEmployee)
        } catch (error) {
          reject(error)
        }
      })

    })
  }

  @get('/employees/count')
  @response(200, {
    description: 'Employee model count',
    content: {'application/json': {schema: CountSchema}},
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
          items: getModelSchemaRef(Employee, {includeRelations: true}),
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
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Employee, {partial: true}),
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
        schema: getModelSchemaRef(Employee, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Employee, {exclude: 'where'}) filter?: FilterExcludingWhere<Employee>
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
          schema: getModelSchemaRef(Employee, {partial: true}),
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
