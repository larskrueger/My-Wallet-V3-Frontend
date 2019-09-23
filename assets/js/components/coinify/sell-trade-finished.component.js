angular
  .module('walletApp')
  .component('sellTradeFinished', {
    bindings: {
      sellTrade: '<',
      completedState: '<',
      dismiss: '&'
    },
    templateUrl: 'partials/coinify/sell-trade-finished.pug',
    controller: CoinifySellTradeFinishedController,
    controllerAs: '$ctrl'
  });

function CoinifySellTradeFinishedController (currency) {
  this.dateFormat = 'd MMMM yyyy, HH:mm';

  if (this.completedState) {
    this.isx = true;
    this.completedState = `SELL.ISX.${this.completedState.toUpperCase()}`;
  } else {
    if (this.sellTrade.state === 'completed' ||
        this.sellTrade.state === 'expired' ||
        this.sellTrade.state === 'cancelled' ||
        this.sellTrade.state === 'rejected') {
      this.tradeCompleted = true;
    } else {
      this.tradeCompleted = false;
    }
    this.id = this.sellTrade.id;
    this.btcSold = currency.convertFromSatoshi(this.sellTrade.sendAmount, currency.bitCurrencies[0]);
    this.bank = this.sellTrade.bankAccountNumber;
    this.creditIssued = `${this.sellTrade.transferOut.receiveAmount} ${this.sellTrade.outCurrency}`;
    this.showNote = () => this.sellTrade.state === 'completed' || this.sellTrade.state === 'awaiting_transfer_in';
  }
}
