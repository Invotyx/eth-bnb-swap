import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

@Injectable()
export class BinanceService {
  constructor(private configService: ConfigService) {}

  async transfer(toAddress, amount) {
    console.log('TRANSFERRING BNB', {
      toAddress,
      amount: parseInt(`${amount * 10 ** 18}`.substring(0, 16)),
    });
    // const INFURA_ID = '8daadcd132c343dda4c8c7b3a99b0707';

    const privateKey = this.configService.get('PRIVATE_KEY');
    const binanceUrl = this.configService.get('BINANCE_URL');
    // const infuraNetwork = 'rinkeby'; // homestead, ropsten, etc
    const provider = new ethers.providers.JsonRpcProvider(binanceUrl, {
      name: 'binance',
      chainId: 97,
    });

    const estimateGas = await provider.estimateGas({
      to: toAddress,
      value: parseInt(`${amount * 10 ** 18}`.substring(0, 16)),
    });
    console.log(
      'ESTIMATED GAS FEE FOR THE TRANSACTION:',
      ethers.utils.formatEther(
        ethers.utils.hexlify(parseInt('' + estimateGas)),
      ),
    );
    const gasLimit = this.configService.get('GAS_LIMIT');

    const currentGasPrice = await provider.getGasPrice();
    const gasPrice = ethers.utils.hexlify(parseInt('' + currentGasPrice));

    const wallet = new ethers.Wallet(privateKey);
    const walletSigner = wallet.connect(provider);
    const tx = {
      from: wallet.address,
      to: toAddress,
      value: parseInt(`${amount * 10 ** 18}`.substring(0, 16)),
      nonce: await provider.getTransactionCount(wallet.address, 'latest'),
      gasLimit: ethers.utils.hexlify(gasLimit),
      gasPrice,
    };

    console.log('TRANSACTION', tx);
    return walletSigner.sendTransaction(tx);
  }
}
