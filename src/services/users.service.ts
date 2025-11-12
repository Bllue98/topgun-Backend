import type { User } from 'src/entities/User';
import usersRepository from 'src/repositories/users.repository';
import { BaseService } from 'src/services/shared/base.service';
import { In } from 'typeorm';
import bcrypt from 'bcryptjs';

class UsersService extends BaseService<User> {
  override repository: typeof usersRepository;

  async getUsersByEmail(email: string): Promise<Partial<User>> {
    return (await this.repository.findOne({ where: { email } })) ?? {};
  }

  override async create(data: Partial<User>): Promise<User> {
    // Create an actual entity instance so @BeforeInsert hooks will fire
    const user = this.repository.create(data);
    return await this.repository.save(user);
  }

  override async retrieve(id: number, relations: string[] = [], select?: Array<keyof User>): Promise<User> {
    const user = await this.repository.findOne({
      where: { id },
      relations,
      ...(select ? { select } : {})
    });

    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    return user;
  }
  async getUsersByEmailOrName(identifier: string): Promise<Partial<User>> {
    return (
      (await this.repository.findOne({
        where: [{ email: identifier }, { name: identifier }],
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          createdAt: true,
          updatedAt: true,
          isActive: true
        }
      })) ?? {}
    );
  }

  async updateCurrentLoggedIn(id: number, updatedData: Partial<User>): Promise<Partial<User>> {
    return await this.save(id, updatedData);
  }

  async getActiveUsers(skip: number, take: number) {
    const [users, total] = await usersRepository.findAndCount({
      where: { isActive: true },
      skip,
      take,
      order: { createdAt: 'DESC' }
    });

    return {
      total,
      data: users
    };
  }

  public async changePassword(id: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.repository.findOne({
      where: { id },
      select: ['id', 'password']
    });

    if (!user || !user.password) {
      throw new Error('Password not set. Please reset your password.');
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentValid) {
      throw new Error('Current password is incorrect');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.repository.update({ id }, { password: hashed });
  }

  public async getUsersEmails(ids: number[]): Promise<string[]> {
    const userss = await this.repository.find({
      where: { id: In(ids) },
      select: ['email']
    });

    return userss.map((users) => users.email ?? '').filter((email) => email !== '');
  }
}

export default new UsersService(usersRepository, 'id');
