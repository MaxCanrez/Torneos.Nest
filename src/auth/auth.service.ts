import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt'

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginUserDto } from './dto/login-user.dto';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,

  ){}

  async create(createUserDto: CreateUserDto) {
    
    try {

      const {password, ...userData} = createUserDto;
      
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });

      await this.userRepository.save(user)
     /*  const { password: _, ...result } = user;  */
      
      return {
      ...user,
      token: this.getJwtToken({id: user.id})
    
    };
    
    } catch (error) {
      this.handleDbExceptions(error);
      
    }

  }

  async login(loginUserDto: LoginUserDto){

    const {password, email} = loginUserDto;

    const user = await this.userRepository.findOne({
      where: {email},
      select: {email:true, password: true, id: true}
    })

    if (!user) 
        throw new UnauthorizedException(`Credenciales invalidas correo `)
    
    if(!bcrypt.compareSync(password, user.password))
        throw new UnauthorizedException(`Credenciales invalidas password `)
    
    
    return {
      ...user,
      token: this.getJwtToken({id: user.id})
    };

  }


  async findAll() {
    try {
      const users = await this.userRepository.find({
        select: ['id', 'nombre', 'email', 'roles', 'isActive', 'expediente'] // Campos visibles
      });
      return users;
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'nombre', 'email', 'roles', 'isActive', 'expediente'],
    });

    if (!user) throw new BadRequestException(`Usuario con ID ${id} no encontrado`);

    return user;
  }


  async update(id: string, updateUserDto: UpdateUserDto) {
  const user = await this.userRepository.preload({
    id,
    ...updateUserDto,
  });

  if (!user) throw new BadRequestException(`Usuario con ID ${id} no encontrado`);

  try {
    await this.userRepository.save(user);
    // No devolver la contraseña
    const { password, ...result } = user;
    return result;
  } catch (error) {
    this.handleDbExceptions(error);
  }
}


  async remove(id: string) {
  const user = await this.userRepository.findOneBy({ id });
  if (!user) throw new BadRequestException(`Usuario con ID ${id} no encontrado`);

  try {
    await this.userRepository.remove(user);
    return { mensaje: `Usuario ${user.nombre} eliminado correctamente` };
  } catch (error) {
    this.handleDbExceptions(error);
  }
}


  private getJwtToken(payload: JwtPayload){

    const token = this.jwtService.sign( payload );
    return token;

  }


  private handleDbExceptions(error: any): never{

    if (error.code === '23505') 
        throw new BadRequestException(error.detail);

    console.log(error)
    
    throw new InternalServerErrorException('please check server logs')    

  }

  async deleteAllUsers() {
  const query = this.userRepository.createQueryBuilder('user');

  try {
    return await query
      .delete()
      .where({})
      .execute();
  } catch (error) {
    this.handleDbExceptions(error);
  }
}


}
