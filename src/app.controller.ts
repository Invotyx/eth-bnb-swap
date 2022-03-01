import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateTransaction } from './dto/createTransaction.dto';

@Controller()
export class AppController {
  getHello(): any {
    throw new Error('Method not implemented.');
  }
  constructor(private readonly appService: AppService) {}

  @Post()
  createTransaction(@Body() createTransaction: CreateTransaction) {
    return this.appService.createTransaction(createTransaction);
  }
}
