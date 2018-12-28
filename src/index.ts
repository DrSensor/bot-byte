import {EventEmitter} from 'events'
import Typed from 'strict-event-emitter-types'

import HWallet from './event-handler'
import {IBot, IOption} from './event-types'
import setOption from './options'

type EventType<T> = Typed<EventEmitter, T>

// TODO: map to https://github.com/byteball/reddit-attestation/blob/master/index.js

export class Bot extends (EventEmitter as { new(): EventType<IBot> }) {
  static get instance() { return HWallet }
  static setOption = setOption

  private _device?: Device
  private _wallet?: Wallet

  constructor(option?: Partial<IOption>) {
    super()
    if (option) Bot.setOption(option)

    this.init().then(events => { // mapping events from https://developer.byteball.org/list-of-events
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
