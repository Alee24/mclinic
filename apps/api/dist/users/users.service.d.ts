import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findOne(email: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    findAll(): Promise<User[]>;
    countActive(): Promise<number>;
    updateUserStatus(email: string, status: boolean): Promise<void>;
    resetPassword(id: number, pass: string): Promise<User | null>;
    update(id: number, updateUserDto: any): Promise<User>;
    remove(id: number): Promise<void>;
}
