import {
  Body,
  Controller,
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
  UserCreatedDto,
  UserPaginationDto,
  UserUpdateDto,
} from './dto/user.dto';
import { UserService } from './user.service';

@Controller('user')
@ApiTags('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private readonly UserService: UserService) {}

  @ApiOperation({ summary: '获取用户列表', description: '获取所有用户的列表' })
  @ApiResponse({ status: 200, description: '成功获取用户列表' })
  @ListResponse('获取用户列表成功')
  @Get('getUserList')
  findAll(@Query() query: UserPaginationDto) {
    this.logger.log('获取用户数据？');
    if (query.pageNum) {
      return this.UserService.findAllByPagination(query);
    } else {
      return this.UserService.findAll();
    }
  }

  @ResponseMessage('获取用户详情成功')
  @Get('detail/:id')
  detail(@Param() id: string) {
    return this.UserService.findOne(id);
  }

  @ResponseMessage('添加用户成功')
  @Post('createUser')
  create(@Body() createdUser: UserCreatedDto) {
    return this.UserService.created(createdUser);
  }

  @ResponseMessage('更新用户成功')
  @Post('/updateUser/:id')
  update(@Param('id') id: string, @Body() updateUser: UserUpdateDto) {
    return this.UserService.update(id, updateUser);
  }

  @ResponseMessage('查询用户详情')
  @Post('/detail/:id')
  find(@Param('id') id) {
    return this.UserService.findOnly(id);
  }

  @ResponseMessage('根据角色查询人员列表')
  @Post('/findUserByRole/:id')
  findUserByRole(@Param('id') id: string) {
    return this.UserService.findUserByRole(id);
  }
}
