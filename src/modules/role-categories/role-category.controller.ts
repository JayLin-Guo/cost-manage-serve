import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ListResponse,
  ResponseMessage,
} from '../../common/decorators/api-response.decorator';
import {
  CreateRoleCategoryDto,
  RoleCategoryPaginationDto,
  UpdateRoleCategoryDto,
} from './dto/role-category.dto';
import { RoleCategoryService } from './role-category.service';

@Controller('role-category')
@ApiTags('role-category')
export class RoleCategoryController {
  private readonly logger = new Logger(RoleCategoryController.name);

  constructor(private readonly roleCategoryService: RoleCategoryService) {}

  @ApiOperation({ summary: '创建角色分类', description: '创建新的角色分类' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ResponseMessage('创建角色分类成功')
  @Post()
  create(@Body() createDto: CreateRoleCategoryDto) {
    return this.roleCategoryService.create(createDto);
  }

  @ApiOperation({
    summary: '获取角色分类列表',
    description: '获取所有角色分类的列表',
  })
  @ApiResponse({ status: 200, description: '成功获取角色分类列表' })
  @ListResponse('获取角色分类列表成功')
  @Get()
  findAll(@Query() query: RoleCategoryPaginationDto) {
    if (query.pageNum) {
      return this.roleCategoryService.findAllByPagination(query);
    } else {
      return this.roleCategoryService.findAll();
    }
  }

  @ApiOperation({
    summary: '获取角色分类详情',
    description: '根据ID获取角色分类详情',
  })
  @ApiResponse({ status: 200, description: '成功获取角色分类详情' })
  @ResponseMessage('获取角色分类详情成功')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleCategoryService.findOne(id);
  }

  @ApiOperation({
    summary: '更新角色分类',
    description: '根据ID更新角色分类信息',
  })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ResponseMessage('更新角色分类成功')
  @Post('/update/:id') // 改为 POST 方式，路径改为 update/:id
  update(@Param('id') id: string, @Body() updateDto: UpdateRoleCategoryDto) {
    return this.roleCategoryService.update(id, updateDto);
  }

  @ApiOperation({ summary: '删除角色分类', description: '根据ID删除角色分类' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ResponseMessage('删除角色分类成功')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleCategoryService.remove(id);
  }
}
