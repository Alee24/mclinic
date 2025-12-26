import { Controller, Get, UseGuards, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get('count-active')
    async countActive() {
        const count = await this.usersService.countActive();
        return { count };
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/reset')
    resetPassword(@Param('id') id: string, @Body('password') password: string) {
        return this.usersService.resetPassword(+id, password);
    }
    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: any) {
        return this.usersService.update(+id, updateUserDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }
}
