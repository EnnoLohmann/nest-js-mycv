import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { UsersService } from './users.service';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthenticateService {
  constructor(private userService: UsersService) {}

  async signup(email: string, password: string) {
    const usersWithEmail = await this.userService.find(email);
    if (usersWithEmail.length) {
      throw new BadRequestException('Email already in use');
    }

    const salt = randomBytes(8).toString('hex');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    const result = `${salt}.${hash.toString('hex')}`;

    return this.userService.create(email, result);
  }

  async signin(email: string, password: string) {
    const [foundUser] = await this.userService.find(email);
    if (!foundUser) {
      throw new NotFoundException('User with given Email not found');
    }

    const [salt, hashedPassword] = foundUser.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (hash.toString('hex') === hashedPassword) {
      return foundUser;
    } else {
      throw new BadRequestException('bad password');
    }
  }
}
