import usersService from 'src/services/users.service';
import { BaseController } from 'src/controllers/shared/base.controller';
import type { User } from 'src/entities/User';

class UserController extends BaseController<User> {}

export default new UserController(usersService);
