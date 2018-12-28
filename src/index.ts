import {EventEmitter} from 'events'
import Typed from 'strict-event-emitter-types'

import HWallet from './event-handler'
import {IBot, IDatabase, IOption, IPairing, IPayment} from './event-types'
import setOption from './options'

type EventType<T> = Typed<EventEmitter, T>

// TODO: map to https://github.com/byteball/reddit-attestation/blob/master/index.js

export class Bot extends (EventEmitter as { new(): EventType<IBot> }) {
  static get instance() { return HWallet }
  static setOption = setOption

  get database(): EventType<IDatabase> { return this._ev }
  get pairing(): EventType<IPairing> { return this._ev }
  get payment(): EventType<IPayment> { return this._ev }

  private readonly _ev = new EventEmitter()
  private _device?: Device
  private _wallet?: Wallet

  constructor(option?: Partial<IOption>) {
    super()
    if (option) Bot.setOption(option)

    this.init().then(events => { // mapping events from https://developer.byteball.org/list-of-events

      events.on('ready', () => this.database.emit('cordova:ready'))
      events.on('started_db_upgrade', () => this.database.emit('upgrade:start'))
      events.on('finished_db_upgrade', () => this.database.emit('upgrade:finish'))

      events.on('pairing_attempt', (...r) => this.pairing.emit('attempt', r[0], r[1]))
      events.on('paired', (...r) => this.pairing.emit('success', r[0], r[1]))
      events.on('removed_paired_device', (...r) => this.pairing.emit('remove', r[0]))

      events.on('new_private_payment', (...r) => this.payment.emit('recieve', r[0]))
      events.on('my_transactions_became_stable', (...r) => this.payment.emit('confirm', r[0]))
      events.on('received_payment', (...r) => this.payment.emit('private:recieve', r[0], r[1], r[2], r[3], r[4]))
      events.on('unhandled_private_payments_left', (...r) => this.payment.emit('private:unhandle', r[0]))

      events.on('text', (...r) => this.emit('message', {
        from_address: r[0],
        text: r[1],
        count: r[2],
        response: (txt: string) => this.sendMessage(r[0], txt)
      }))
    }).catch(err => this.emit('error', err))
  }

  sendMessage(to_address: string, message: string) {
    if (!this._device) throw new Error('Bot not ready')
    else this._device.sendMessageToDevice(to_address, 'text', message)
  }

  sendPayment(recipient_address: string, amount: number) {
    if (!this._wallet) throw new Error('Bot not ready')
    else this._wallet.issueChangeAddressAndSendPayment(null, amount, recipient_address, undefined,
      (err: Error, unit: number) => this.payment.emit('send', unit, err)
    )
  }

  private async init() {
    /// use of `await import` is for module thaat immediately run a service 😓
    this._wallet = await import('headless-byteball')
    this._device = await import('byteballcore/device')
    const eventBus = require('byteballcore/event_bus')
    return new Promise<EventEmitter>(async resolve => {
      eventBus.once('headless_wallet_ready', () => {
        this._wallet!.setupChatEventHandlers()
        this.emit('ready', this._device!)
        resolve(eventBus)
      })
    })
  }
}
