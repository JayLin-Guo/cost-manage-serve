import { 
  Controller, 
  Post, 
  Get, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  ParseIntPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ResponseMessage, ListResponse } from '../../common/decorators/api-response.decorator';

@ApiTags('projects')
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiOperation({ summary: '创建项目', description: '创建一个新的项目' })
  @ApiResponse({ status: 201, description: '项目创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ResponseMessage('项目创建成功')
  @Post('addProject')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProjectDto: CreateProjectDto) {
    // 使用admin用户(ID=1)作为默认创建者
    return this.projectService.create(createProjectDto, 1);
  }

  @ApiOperation({ summary: '获取项目列表', description: '获取所有项目的列表' })
  @ApiResponse({ status: 200, description: '成功获取项目列表' })
  @ListResponse('获取项目列表成功')
  @Get('list')
  findAll() {
    return this.projectService.findAll();
  }

  @ApiOperation({ summary: '获取项目详情', description: '根据ID获取单个项目的详细信息' })
  @ApiParam({ name: 'id', description: '项目ID', type: 'number' })
  @ApiResponse({ status: 200, description: '成功获取项目详情' })
  @ApiResponse({ status: 404, description: '项目不存在' })
  @ResponseMessage('获取项目详情成功')
  @Get('detail/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectService.findOne(id);
  }

  @ApiOperation({ summary: '更新项目', description: '根据ID更新项目信息' })
  @ApiParam({ name: 'id', description: '项目ID', type: 'number' })
  @ApiResponse({ status: 200, description: '项目更新成功' })
  @ApiResponse({ status: 404, description: '项目不存在' })
  @ResponseMessage('项目更新成功')
  @Patch('update/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto
  ) {
    return this.projectService.update(id, updateProjectDto);
  }

  @ApiOperation({ summary: '删除项目', description: '根据ID删除项目' })
  @ApiParam({ name: 'id', description: '项目ID', type: 'number' })
  @ApiResponse({ status: 204, description: '项目删除成功' })
  @ApiResponse({ status: 404, description: '项目不存在' })
  @ResponseMessage('项目删除成功')
  @Delete('delete/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.projectService.remove(id);
  }
}
