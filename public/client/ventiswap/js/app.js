const BASE_URL = 'https://still-scrubland-93979.herokuapp.com/';
const ETH_ADMIN_ACCOUNT_KEY = '0x4873725Dc4692236f474349Ba07a6fb3c5F323f2';

var DISPLAY_CURRENCY = JSON.parse(
  '{"symbol":"USD","code":"$","name":"US Dollar","rate":"1.00000","last_updated":"2021-08-17 12:00:03"}',
);
var checkupdate = 0;

function formatDecimal(number) {
  if (typeof numeral != 'undefined') {
    var format;
    var num = numeral(number);
    var n = Math.abs(num.value());
    if (n > 0.01) {
      format = '0,0.00';
    } else if (0.0001 < n && n < 0.01) {
      format = '0.0000';
    } else if (0.000001 < n && n < 0.0001) {
      format = '0.000000';
    } else if (n < 0.000001) {
      format = '0.00000000';
    }
    var formatted = num.format(format);
    return formatted !== 'NaN' ? formatted : parseFloat(number).toFixed(8);
  }
  return number;
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatPercentage(number) {
  if (typeof numeral != 'undefined') {
    var format;
    var num = numeral(number);
    var n = Math.abs(num.value()) * 100;
    if (n > 0.01) {
      format = '0,0.00%';
    } else if (0.0001 < n && n < 0.01) {
      format = '0.0000%';
    } else if (0.000001 < n && n < 0.0001) {
      format = '0.000000%';
    } else if (n < 0.000001) {
      format = '0.00000000%';
    }
    var formatted = num.format(format);
    return formatted !== 'NaN' ? formatted : parseFloat(number).toFixed(2);
  }
  return number;
}

function formatState(data, container) {
  // <img src="https://www.cryptocompare.com/'+state.data-image+'"/>

  if (!data.id) {
    return data.text;
  }

  if (data.text == 'VST') {
    var $state = $(
      '<span><img src="https://ventiswap.com/ventiswap/images/' +
        $(data.element).attr('data-image') +
        '"/>' +
        data.text +
        '</span>',
    );
  } else {
    var $state = $(
      '<span><img src="https://www.cryptocompare.com/' +
        $(data.element).attr('data-image') +
        '"/>' +
        data.text +
        '</span>',
    );
  }
  return $state;
}

///  Calling API and modeling data for each chart ///
function getPercentageChange(oldNumber, newNumber) {
  var decreaseValue = oldNumber - newNumber;

  return (decreaseValue / oldNumber) * 100;
}

var alltockenlist = '';
var updatedtocken = '';
const allCoinData = async () => {
  const response = await fetch(
    'https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH,BNB,&tsyms=USD&api_key=2bddccf182603a175db12737859bf41e4d9b0f341d8e3151e0433e434a910d16',
  );
  const json = await response.json();
  const colinlist = json.RAW;
  return {
    colinlist,
  };
};

/// Error handling ///
function checkStatus(response) {
  if (response.ok) {
    return Promise.resolve(response);
  } else {
    return Promise.reject(new Error(response.statusText));
  }
}

function updatealltocenlist(list) {
  var data = [];

  for (var key in list) {
    var value = list[key];

    data[key] = {
      symbole: value.USD.FROMSYMBOL,
      price: value.USD.PRICE,
      avg: value.USD.CHANGEPCTDAY,
      mktcap: value.USD.MKTCAP,
      supply: value.USD.SUPPLY,
    };
  }
  return data;
}

function returnCoinData(fsyms) {
  var coinData = 0;
  for (var key in updatedtocken) {
    var value = updatedtocken[key];

    if (key == fsyms.toUpperCase()) {
      coinData = value;
    }
  }

  return coinData;
}

async function fetchApptocknData() {
  let { colinlist } = await allCoinData();
  alltockenlist = colinlist;
  updatedtocken = updatealltocenlist(colinlist);

  $('.Allcoin,.single-coin').each(function () {
    allCoinChart($(this).attr('data-fsyms'));
  });
  updateBitcoinPrice();
}

async function automaticallyupdate() {
  let { colinlist } = await allCoinData();
  alltockenlist = colinlist;
  updatedtocken = updatealltocenlist(colinlist);

  let totalassets = document.getElementById('totalassets');
  let totalaverage = document.getElementById('totalaverage');
  let totalprice = 0;
  checkupdate = 0;
  var finalavg = 0;
  // totalassets.setAttribute('data-total', totalprice);
  // totalassets.innerHTML = '$' + numberWithCommas(totalprice.toFixed(2));
  // totalaverage.setAttribute('data-avg', finalavg);
  // totalaverage.innerHTML = Math.abs(finalavg.toFixed(2));
  $('.Allcoin,.single-coin,.coin-watch').each(function () {
    autoupdateprice($(this).attr('data-fsyms'));
  });
}

function autoupdateprice(fsyms) {
  var fsymC = fsyms;
  if (fsyms == 'eths') fsymC = 'eth';
  if (fsyms == 'sols') fsymC = 'sol';
  let coinData = returnCoinData(fsymC);

  let currentPrice = coinData.price;
  let averg = coinData.avg;
  let supply = coinData.supply;
  let mktcap = coinData.mktcap;

  let btcPrice = document.getElementById(fsyms + 'Price');
  let btccoin = btcPrice.getAttribute('data-coin');
  btcPrice.innerHTML =
    '$' + numberWithCommas((currentPrice * btccoin).toFixed(2));

  let Supply = document.getElementById(fsyms + 'Supply');
  if (Supply) Supply.innerHTML = numberWithCommas(supply.toFixed(2));

  let Cap = document.getElementById(fsyms + 'Cap');
  if (Cap) Cap.innerHTML = '$' + numberWithCommas(mktcap.toFixed(2));

  document.getElementById(fsyms + 'Avg').innerHTML =
    Math.abs(averg).toFixed(2) + '%';
  if (averg < 0) {
    document.getElementById(fsyms + 'A').classList.add('red');
    document.getElementById(fsyms + 'A').classList.remove('green');
  } else {
    document.getElementById(fsyms + 'A').classList.add('green');
    document.getElementById(fsyms + 'A').classList.remove('red');
  }

  var assetsCoin = ['BTC', 'ETH', 'BNB'];

  if (assetsCoin.indexOf(fsyms.toUpperCase()) >= 0) {
    checkupdate++;
    let totalassets = document.getElementById('totalassets');
    let totalprice =
      parseFloat(totalassets.getAttribute('data-total')) +
      parseFloat(currentPrice * btccoin);
    totalassets.setAttribute('data-total', totalprice);
    totalassets.innerHTML = '$' + numberWithCommas(totalprice.toFixed(2));

    let prcentagtotal = document.getElementById('prcentagtotal');
    let totalaverage = document.getElementById('totalaverage');

    let datavg = totalaverage.getAttribute('data-avg');
    var finalavg = parseFloat(averg) + parseFloat(datavg);

    if (checkupdate == 3) finalavg = finalavg / 3;

    totalaverage.setAttribute('data-avg', finalavg);
    totalaverage.innerHTML = Math.abs(finalavg.toFixed(2));
    if (finalavg < 0) {
      prcentagtotal.classList.add('red');
      prcentagtotal.classList.remove('green');
    } else {
      prcentagtotal.classList.add('green');
      prcentagtotal.classList.remove('red');
    }
  }
}

function updateBitcoinPrice() {
  var dropdownArray = ['BNB', 'ETH'];
  for (var key in alltockenlist) {
    if (dropdownArray.indexOf(key) >= 0) {
      var value = alltockenlist[key];

      var el = document.createElement('option');
      el.textContent = value.USD.FROMSYMBOL;
      el.value = value.USD.FROMSYMBOL;
      el.setAttribute('data-image', value.USD.IMAGEURL);
      var currentPrice = value.USD.HIGHHOUR * DISPLAY_CURRENCY.rate;

      document.getElementById('fromCoin').appendChild(el);
      var el = document.createElement('option');
      el.textContent = value.USD.FROMSYMBOL;
      el.value = value.USD.FROMSYMBOL;
      el.setAttribute('data-image', value.USD.IMAGEURL);

      document.getElementById('toCoin').appendChild(el);
    }
  }

  var el = document.createElement('option');
  el.textContent = 'VST';
  el.value = 'VST';
  el.setAttribute('data-image', 'vst.png');

  document.getElementById('fromCoin').appendChild(el);

  var el = document.createElement('option');
  el.textContent = 'VST';
  el.value = 'VST';
  el.setAttribute('data-image', 'vst.png');

  document.getElementById('toCoin').appendChild(el);

  myselect = jQuery('.coinselect').select2({
    width: '175px',
    templateResult: formatState,
    placeholder: 'Select Coin',
  });
  myselect.on('change', function (sel) {
    var toCoinimag = $('#toCoin option:selected').attr('data-image');

    if ($('#toCoin').val() == 'VST') {
      var imagePath = 'https://www.ventiswap.com/ventiswap/images';
    } else {
      var imagePath = 'https://www.cryptocompare.com';
    }

    jQuery('#select2-toCoin-container')
      .parent('.select2-selection')
      .find('img')
      .remove();
    jQuery('#select2-toCoin-container')
      .parent('.select2-selection')
      .prepend('<img src="' + imagePath + '/' + toCoinimag + '"/>');

    if ($('#fromCoin').val() == 'VST') {
      var imagePath = 'https://www.ventiswap.com/ventiswap/images';
    } else {
      var imagePath = 'https://www.cryptocompare.com';
    }

    var fromCoinimag = $('#fromCoin option:selected').attr('data-image');
    jQuery('#select2-fromCoin-container')
      .parent('.select2-selection')
      .find('img')
      .remove();
    jQuery('#select2-fromCoin-container')
      .parent('.select2-selection')
      .prepend('<img src="' + imagePath + '/' + fromCoinimag + '"/>');
  });
  $('#fromCoin').val($('#fromCoin option:eq(1)').val()).trigger('change');
  $('#toCoin').val($('#toCoin option:eq(2)').val()).trigger('change');
  $('.from-swap .inputnumber').val('1').trigger('change');
}

const checkavg = async (fsyms) => {
  var averg = 0;
  for (var key in updatedtocken) {
    var value = updatedtocken[key];

    var fsymC = fsyms;
    if (fsyms == 'eths') fsymC = 'eth';
    if (fsyms == 'sols') fsymC = 'sol';

    if (key == fsymC.toUpperCase()) {
      averg = value.avg;
    }
  }
  return {
    averg,
  };
};
async function allCoinChart(fsyms) {
  var $this = $('.' + fsyms + '-coin');

  let { times, prices } = await allCoinChartData(fsyms);
  let { averg } = await checkavg(fsyms);

  if ($this.hasClass('Allcoin') && fsyms == 'eth') {
    fsyms = 'eths';
  }

  let btcChart = document.getElementById(fsyms + 'Chart').getContext('2d');

  let gradient = btcChart.createLinearGradient(0, 0, 0, 400);

  if (averg < 0) {
    gradient.addColorStop(0, 'rgba(255,64,104,.5)');
    gradient.addColorStop(0.425, 'rgba(255,64,104,0)');
    var $bgcolor = 'rgba(255,64,104,.5)';
  } else {
    gradient.addColorStop(0, 'rgba(93,209,101,.5)');
    gradient.addColorStop(0.425, 'rgba(93,209,101,0)');
    var $bgcolor = 'rgba(93,209,101,.5)';
  }

  Chart.defaults.global.defaultFontFamily = 'Red Hat Text';
  Chart.defaults.global.defaultFontSize = 12;

  createBtcChart = new Chart(btcChart, {
    type: 'line',
    data: {
      labels: times,
      datasets: [
        {
          label: '$',
          data: prices,
          backgroundColor: gradient,
          borderColor: $bgcolor,
          borderJoinStyle: 'round',
          borderCapStyle: 'round',
          borderWidth: 1,
          pointRadius: 0,
          pointHitRadius: 10,
          lineTension: 0.2,
        },
      ],
    },

    options: {
      title: {
        display: false,
        text: 'Heckin Chart!',
        fontSize: 35,
      },

      legend: {
        display: false,
      },

      layout: {
        padding: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        },
      },

      scales: {
        xAxes: [
          {
            display: false,
            gridLines: {},
          },
        ],
        yAxes: [
          {
            display: false,
            gridLines: {},
          },
        ],
      },

      tooltips: {
        enabled: false,
        callbacks: {
          //This removes the tooltip title
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          title: function () {},
        },
        //this removes legend color
        displayColors: false,
        yPadding: 10,
        xPadding: 10,
        position: 'nearest',
        caretSize: 10,
        backgroundColor: 'rgba(255,255,255,.9)',
        bodyFontSize: 15,
        bodyFontColor: '#303030',
      },
    },
  });
}
var fromValue = 'ETH';
var toValue = 'BNB';

$(document).ready(function () {
  fetchApptocknData();
  automaticallyupdate();

  $(document).on('keyup change', '.from-swap .inputnumber', function () {
    //alert(12);
    var $fromprice = $('.from-swap .inputnumber').val();
    var $toprice = $('.to-swap .inputnumber').val();

    if ($('.from-swap .coinselect').val() == 'VST') {
      var $fromcoin = 0.09;
    } else {
      var $fromcoin = returnCoinData($('.from-swap .coinselect').val()).price;
    }

    if ($('.to-swap .coinselect').val() == 'VST') {
      var $toCoin = 0.09;
    } else {
      var $toCoin = returnCoinData($('.to-swap .coinselect').val()).price;
    }

    $('.to-swap .inputnumber').val(($toprice * $fromprice).toFixed(2));
    $('.from-swap .usdprice').html(
      '$' + numberWithCommas(($fromcoin * $fromprice).toFixed(2)),
    );
    var $convertprice = (($fromcoin * $fromprice) / $toCoin).toFixed(2);
    $('.to-swap .inputnumber').val($convertprice);
    $('.to-swap .usdprice').html(
      '$' + numberWithCommas(($convertprice * $toCoin).toFixed(2)),
    );
  });

  $('.switchbutton').click(function (event) {
    event.preventDefault();
    fromValue = $('#fromCoin').val();
    $('#fromCoin').val($('#toCoin').val());
    $('#toCoin').val(fromValue);
    const checkSwaperState = $('#check-swaper-state').val();
    $('#check-swaper-state').val(checkSwaperState === 'on' ? 'off' : 'on');

    $('.buy-sell').toggleClass('switch');

    $('.eth-stats').each(function () {
      var dataType = $(this).attr('data-swap');
      var ariadataType = $(this).attr('aria-data-swap');
      $(this)
        .addClass(ariadataType + '-swap')
        .removeClass(dataType + '-swap')
        .attr('aria-data-swap', dataType)
        .attr('data-swap', ariadataType);
    });
    // $('.from-swap .inputnumber').val('1').trigger('change');
  });

  $('.coinselect').change(function (event) {
    event.preventDefault();
    var $fromprice = $('.from-swap .inputnumber').val();
    var $toprice = $('.to-swap .inputnumber').val();
    if ($('.from-swap .coinselect').val() == 'VST') {
      var $fromcoin = 0.09;
    } else {
      var $fromcoin = returnCoinData($('.from-swap .coinselect').val()).price;
    }

    if ($('.to-swap .coinselect').val() == 'VST') {
      var $toCoin = 0.09;
    } else {
      var $toCoin = returnCoinData($('.to-swap .coinselect').val()).price;
    }
    $('.from-swap .usdprice').html(
      '$' + numberWithCommas(($fromcoin * $fromprice).toFixed(2)),
    );
    var $convertprice = (($fromcoin * $fromprice) / $toCoin).toFixed(2);

    $('.to-swap .inputnumber').val($convertprice);
    $('.to-swap .usdprice').html(
      '$' + numberWithCommas(($convertprice * $toCoin).toFixed(2)),
    );
  });
});

setInterval(function () {
  automaticallyupdate();
}, 10000);

setInterval(function () {
  $('.Allcoin,.single-coin').each(function () {
    allCoinChart($(this).attr('data-fsyms'));
  });
}, 60000);

$('.swap').click(function () {
  const toAddressInput = $('#toAddressInput').val();
  if (toAddressInput !== '') {
    var amountIn = $('#fromConv').val();
    const fromCoin = $('#fromCoin').val();
    const toCoin = $('#toCoin').val();

    if (fromCoin === 'ETH' || fromCoin === 'BNB') {
      swap(amountIn, toAddressInput, fromCoin, toCoin);
    }
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
    console.log('got accounts', accounts);
    await ethereum.enable();
    var web3 = await new Web3(window.ethereum);
    await web3.eth.getAccounts();
    get_balace();
  } else {
    alert('There is no ethereum wallet connected.');
  }
});

async function get_balace() {
  var web3 = new Web3(window.ethereum);
  await window.ethereum.enable();
  //   var swap_contract = new web3.eth.Contract(token_abi,token_address);
  // var token_contract = new web3.eth.Contract(tokenABI,tokenAddresses[2].address);
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

  //const balancetoken = await token_contract.methods.balanceOf(account[0]).call();
  // console.log('DAI'+balancetoken);
  // swap_contract.methods.balance().call({from: account[0]}).then(function(res){
  //   console.log(res);
  // });
  amountHex = '1000000000000000000';
  // token_contract.methods.approve(contract,amountHex).send({from:account[0]}).then(function(result){
  //   console.log(result);
  //   swap_contract.methods.swap_token(0,0,amountHex,15,account[0]).send({from: account[0]}).then(function(err,res){
  //   console.log(res);
  // });
  // });
  web3.eth.net.getId().then(async (netId) => {
    // console.log(netId);
    active_net = netId;
    if (netId == 3) {
      //   alert("Ropston test net is selected");
      $('.connect').html('Ropston Network  - ' + account[0] + '');
    } else if (netId == 97) {
      $('.connect').html('BSC test net  - ' + account[0] + '');
    } else if (netId == 4) {
      $('.connect').html('Rinkeby test net  - ' + account[0] + '');
    }
  });
}
