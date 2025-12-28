import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('wallets')
export class WalletsController {
    constructor(private readonly walletsService: WalletsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('balance')
    async getBalance(@Request() req: any) {
        const userId = req.user.sub || req.user.id;
        return this.walletsService.getBalance(userId);
    }
}
