const BASE_URL = 'https://still-scrubland-93979.herokuapp.com/';
const ETH_ADMIN_ACCOUNT_KEY = '0x4873725Dc4692236f474349Ba07a6fb3c5F323f2';

//to get coins latest price
const allCoinData = async () => {
  const response = await fetch(
    'https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH,BNB,&tsyms=USD&api_key=2bddccf182603a175db12737859bf41e4d9b0f341d8e3151e0433e434a910d16',
  );
  const json = await response.json();
  const coinList = json.RAW;
  return {
    coinList,
  };
};

async function convertCoinValue() {
  let { coinList } = await allCoinData();
  const fromPrice = document.getElementById('fromCoin').value;
  fromCoin = coinList.ETH.USD.PRICE;
  const toCoin = coinList.BNB.USD.PRICE;
  if (toCoin) {
    var convertPrice = ((fromCoin * fromPrice) / toCoin).toFixed(2);

    let element = document.getElementById('toCoin');

    element.value = convertPrice;
  }
}

async function checkConnection() {
  const testConnection = await ethereum.isConnected();
  if (testConnection) {
    toggle();
  }
}

$(document).ready(function () {
  checkConnection();
  allCoinData();
  convertCoinValue();

  $(document).on('keyup change', ' .inputnumber', function () {
    convertCoinValue();
  });
});

$('.swap').click(function () {
  const toAddressInput = $('#toAddressInput').val();
  if (toAddressInput !== '') {
    var amountIn = document.getElementById('fromCoin').value;

    console.log('amount in value', amountIn);
    const fromCoin = 'ETH';
    const toCoin = 'BNB';

    swap(amountIn, toAddressInput, fromCoin, toCoin);
  } else {
    alert('please enter To address.');
  }
});

async function swap(amountIn, toAddress, fromCoin, toCoin) {
  if (window.ethereum) {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const amount = ethers.utils.parseEther(amountIn);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const tx = await signer.sendTransaction({
      to: ETH_ADMIN_ACCOUNT_KEY,
      value: amount,
    });
    const hash = tx.hash;
    const message = `${fromCoin} ${toCoin} ${toAddress} ${amountIn} ${hash}`;
    const message1 = ethers.utils.id(message);
    const signature = await signer.signMessage(message1);
    const fromAddress = await signer.getAddress();
    makeApiRequest(
      fromCoin,
      toCoin,
      fromAddress,
      toAddress,
      amountIn,
      hash,
      signature,
    );
  } else {
    throw new Error('No crypto wallet found. Please install it.');
  }
}

async function makeApiRequest(
  fromCoin,
  toCoin,
  fromAddress,
  toAddress,
  amount,
  hash,
  signature,
) {
  const requestPayload = {
    fromCoin,
    toCoin,
    fromAddress,
    toAddress,
    amount,
    hash,
    signature,
  };
  axios
    .post(BASE_URL, requestPayload, {
      headers: { 'Content-Type': 'application/json' },
    })
    .then((res) => {
      console.log('====================================');
      console.log(res.data);
      console.log('====================================');
    })
    .catch((err) => {
      console.log('====================================');
      console.log(err);
      console.log('====================================');
    });
}

$('.connect').click(async function () {
  if (window.ethereum) {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    await ethereum.enable();
    var web3 = await new Web3(window.ethereum);
    await web3.eth.getAccounts();
    console.log('web3', web3);
    get_balace();
    toggle();
  } else {
    alert('There is no ethereum wallet connected.');
  }
});

async function get_balace() {
  var web3 = new Web3(window.ethereum);
  await window.ethereum.enable();
  var account = await web3.eth.getAccounts();
  web3.eth.defaultAccount = account[0];
  var balance = await web3.eth.getBalance(account[0]);
  var walletbalance = parseFloat(web3.utils.fromWei(balance, 'ether')).toFixed(
    2,
  );
  jQuery('.eth-balance').html(walletbalance);
  jQuery('#ethPrice').attr('data-coin', walletbalance);
  await autoupdateprice('eth');
  automaticallyupdate();

  for (let tokenAddress of tokenAddresses) {
    console.log(tokenAddress.address);
    var token_contract = new web3.eth.Contract(tokenABI, tokenAddress.address);
    const tokenBalance = await token_contract.methods
      .balanceOf(account[0])
      .call();
    console.log(tokenBalance);
  }
  amountHex = '1000000000000000000';
  web3.eth.net.getId().then(async (netId) => {
    active_net = netId;
    if (netId == 3) {
      $('.connect').html('Ropston Network  - ' + account[0] + '');
    } else if (netId == 97) {
      $('.connect').html('BSC test net  - ' + account[0] + '');
    } else if (netId == 4) {
      $('.connect').html('Rinkeby test net  - ' + account[0] + '');
    }
  });
}
