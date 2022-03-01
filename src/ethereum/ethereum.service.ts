import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class EthereumService {
  async verifySigner(message, signature, signer) {
    console.log('TOKEN VERIFICATION', message, signature, signer);
    const verificationMessage = ethers.utils.id(message);

    console.log('VERIFICATION MESSAGE', verificationMessage);
    const signerAddr = await ethers.utils.verifyMessage(
      verificationMessage,
      signature,
    );

    console.log('SIGNER FROM SIGNATURE', signerAddr);
    if (signerAddr === signer) {
      return true;
    }
    return false;
  }
}
