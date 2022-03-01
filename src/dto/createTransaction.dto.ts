import { ApiProperty } from '@nestjs/swagger';

export enum Coin {
  BNB = 'BNB',
  ETH = 'ETH',
}

export class CreateTransaction {
  @ApiProperty()
  fromCoin: Coin;
  @ApiProperty()
  toCoin: Coin;
  @ApiProperty()
  fromAddress: string;
  @ApiProperty()
  toAddress: string;
  @ApiProperty()
  amount: number;
  @ApiProperty()
  hash: string;
  @ApiProperty()
  signature: any;
}
