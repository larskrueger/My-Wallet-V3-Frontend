angular.module('walletApp.core').factory 'MyWalletPayment', ($q) ->
  (_, shouldReject) ->

    tx = {
      txid: 'tx-hash'
    }

    deferred = $q.defer()
    if shouldReject
      deferred.reject('err_message')
    else
      deferred.resolve(tx)

    this.payment = deferred.promise
    this.from = (addr) -> this
    this.to = (dest) -> this
    this.amount = (amount) -> this
    this.fee = (fee) -> this
    this.feePerKb = (feePerKb) -> this
    this.note = (note) -> this
    this.sweep = () -> this
    this.build = () -> this
    this.then = (cb) -> cb({ transaction: 'tx' }); this
    this.catch = () -> this
    this.sideEffect = () -> this
    this.sign = (pass) -> this
    this.publish = () -> this
    this.on = (e, f) -> this.triggerUpdate = f; this
    this
