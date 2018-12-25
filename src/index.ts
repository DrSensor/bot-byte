import {EventEmitter} from 'events'
import Typed from 'strict-event-emitter-types'

import HWallet from './event-handler'
import {IBot} from './event-types'

type EventType<T> = Typed<EventEmitter, T>

// TODO: map to https://github.com/byteball/reddit-attestation/blob/master/index.js

export default class Bot extends (EventEmitter as { new(): EventType<IBot> }) {
  private _device?: Device
  private _wallet?: Wallet

  constructor() {
    super()
    // #region still doubting 🤔 do I need to simplify this? (and how!)
    HWallet.started(() => { this.emit('init') })
    HWallet.onAsking('passphrase', () => { this.emit('passphrase') })
    // #endregion
  }

  private async init() {
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
