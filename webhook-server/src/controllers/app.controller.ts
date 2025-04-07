import { Body, Controller, Get } from '@nestjs/common';
import { AppService } from '../services/app.service';

@Controller('webhook')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Body() payload: any): void {
    console.log(payload);
  }
}
