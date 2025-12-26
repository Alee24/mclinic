import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<import("./entities/user.entity").User[]>;
    countActive(): Promise<{
        count: number;
    }>;
    resetPassword(id: string, password: string): Promise<import("./entities/user.entity").User | null>;
    update(id: string, updateUserDto: any): Promise<import("./entities/user.entity").User>;
    remove(id: string): Promise<void>;
}
