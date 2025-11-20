import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ListResponse,
  ResponseMessage,
} from '../../common/decorators/api-response.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectService } from './project.service';

@ApiTags('projects')
@Controller('projects')
export class ProjectController {
  private readonly logger = new Logger(ProjectController.name);

  constructor(private readonly projectService: ProjectService) {}

  @ApiOperation({ summary: '创建项目', description: '创建一个新的项目' })
  @ApiResponse({ status: 201, description: '项目创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ResponseMessage('项目创建成功')
  @Post('addProject')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProjectDto: CreateProjectDto) {
    try {
      // 动态获取admin用户ID作为默认创建者
      const adminUser = await this.projectService.findAdminUser();
      const result = await this.projectService.create(
        createProjectDto,
        adminUser.id,
      );

      return result;
    } catch (error) {
      this.logger.error('Controller层捕获错误:', error.message);
      this.logger.error('错误堆栈:', error.stack);

      // 抛出HTTP异常，返回详细错误信息
      throw new HttpException(
        {
          message: '创建项目失败',
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: '获取项目列表', description: '获取所有项目的列表' })
  @ApiResponse({ status: 200, description: '成功获取项目列表' })
  @ListResponse('获取项目列表成功')
  @Get('list')
  findAll(@Query() query: any) {
    // this.logger.log('Controller层捕获错误:', query);
    return this.projectService.findAll(query);
  }

  @ApiOperation({
    summary: '获取项目详情',
    description: '根据ID获取单个项目的详细信息',
  })
  @ApiParam({ name: 'id', description: '项目ID', type: 'string' })
  @ApiResponse({ status: 200, description: '成功获取项目详情' })
  @ApiResponse({ status: 404, description: '项目不存在' })
  @ResponseMessage('获取项目详情成功')
  @Get('detail/:id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @ApiOperation({ summary: '更新项目', description: '根据ID更新项目信息' })
  @ApiParam({ name: 'id', description: '项目ID', type: 'string' })
  @ApiResponse({ status: 200, description: '项目更新成功' })
  @ApiResponse({ status: 404, description: '项目不存在' })
  @ResponseMessage('项目更新成功')
  @Post('update')
  update(@Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(updateProjectDto);
  }

  @ApiOperation({ summary: '删除项目', description: '根据ID删除项目' })
  @ApiParam({ name: 'id', description: '项目ID', type: 'string' })
  @ApiResponse({ status: 200, description: '项目删除成功' })
  @ApiResponse({ status: 404, description: '项目不存在' })
  @ResponseMessage('项目删除成功')
  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }
}
