import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { BinanceService } from './binance/binance.service';
import { Coin, CreateTransaction } from './dto/createTransaction.dto';
import { EthereumService } from './ethereum/ethereum.service';

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    private readonly ethereumService: EthereumService,
    private readonly binanceService: BinanceService,
  ) {}

  async createTransaction(createTransaction: CreateTransaction) {
    const {
      fromCoin,
      toCoin,
      fromAddress,
      toAddress,
      amount,
      hash,
      signature,
    } = createTransaction;

    const message = `${fromCoin} ${toCoin} ${toAddress} ${amount} ${hash}`;

    let isVerified = false;
    switch (fromCoin) {
      case Coin.ETH:
        isVerified = await this.ethereumService.verifySigner(
          message,
          signature,
          fromAddress,
        );
        break;

      default:
        throw new BadRequestException(
          'Coin you want to exchange is not supported',
        );
    }

    if (!isVerified) {
      throw new BadRequestException('Signature is not valid');
    }

    const toAmount = await this.getToAmount(fromCoin, toCoin, amount);

    switch (toCoin) {
      case Coin.BNB:
        return this.binanceService.transfer(toAddress, toAmount);

      default:
        throw new BadRequestException(
          'Coin you want to exchange is not available',
        );
    }
  }

  private async getToAmount(fromCoin, toCoin, fromAmount) {
    console.log('CONVERSION', fromCoin, toCoin, fromAmount);

    const { data } = await firstValueFrom(
      this.httpService.get(
        `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${fromCoin}&tsyms=${toCoin}&api_key=2bddccf182603a175db12737859bf41e4d9b0f341d8e3151e0433e434a910d16`,
      ),
    );
    return data.RAW[fromCoin][toCoin].PRICE * fromAmount;
  }
}
