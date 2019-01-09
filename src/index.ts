import {getAppDataDir, getAppRootDir} from 'byteballcore/desktop_app'
import {EventEmitter} from 'events'
import {dirname} from 'path'
import Typed from 'strict-event-emitter-types'

import shimmer from './event-handler'
import {IBot, IDatabase, IPairing, IPayment} from './event-types'
import {getOption, IOption, LIVENET, setOption, TESTNET} from './options'
import {transformExpression} from './utils/template-literals'

type EventType<T> = Typed<EventEmitter, T>

// TODO: map to https://github.com/byteball/reddit-attestation/blob/master/index.js

export {LIVENET, TESTNET} from './options'
const trimTrailingSpace = (str: string) => str.trimLeft().trimRight()

export class Bot extends (EventEmitter as new() => EventType<IBot>) {
  static get instance() { return shimmer }
  static get explorerSite() { return getOption().testnet ? TESTNET.explorer : LIVENET.explorer }

  get database(): EventType<IDatabase> { return this._ev }
  get pairing(): EventType<IPairing> { return this._ev }
  get payment(): EventType<IPayment> { return this._ev }
  static setOption = setOption

  // mimick https://github.com/electron/electron/blob/master/docs/api/app.md#appgetpathname
  static getPath(name: 'userData' | 'appData' | 'package.json'): string | never {
    if (name === 'userData') return getAppDataDir()
    else if (name === 'package.json') return getAppRootDir()
    else if (name === 'appData') return dirname(getAppDataDir())
    else throw new Error("name must be one of these: 'userData', 'appData', or 'package.json")
  }

  private readonly _ev = new EventEmitter()
  private address?: string
  private core?: {
    device: Device
    wallet: Wallet
    composer: LazyImport<any>
    network: LazyImport<any>
    // db: LazyImport<any> // TODO: use it if there is side-effect
  }

  private readonly db = require('byteballcore/db')

  constructor(option?: Partial<IOption>) {
    super()
    if (option) Bot.setOption(option)

    this.init().then(events => { // mapping events from https://developer.byteball.org/list-of-events
      // TODO: this._ev = events

      //#region IDatabase
      events.on('ready', () => this.database.emit('cordova:ready'))
      events.on('started_db_upgrade', () => this.database.emit('upgrade:start'))
      events.on('finished_db_upgrade', () => this.database.emit('upgrade:finish'))
      //#endregion

      //#region IPairing
      events.on('pairing_attempt', (...r) => this.pairing.emit('attempt', r[0], r[1]))
      events.on('paired', (...r) => this.pairing.emit('success', r[0], r[1]))
      events.on('removed_paired_device', (...r) => this.pairing.emit('remove', r[0]))
      //#endregion

      //#region IPayment
      events.on('received_payment', (...r) => this.payment.emit('private:receive', r[0], r[1], r[2], r[3], r[4]))
      events.on('unhandled_private_payments_left', (...r) => this.payment.emit('private:unhandle', r[0]))
      events.on('new_my_transactions', arrUnits => this.getPaymentDetails(['asset', 'amount', 'address'], arrUnits)
        .then(row => this.payment.emit('receive', row.address as string, row.amount as number, arrUnits))
      )
      events.on('my_transactions_became_stable', arrUnits => this.getPaymentDetails(['asset', 'amount', 'address'], arrUnits)
        .then(row => this.payment.emit('confirm', row.address as string, row.amount as number, arrUnits))
      )
      //#endregion

      events.on('text', (...r) => this.emit('message', {
        from_address: r[0],
        text: r[1],
        count: r[2],
        response: (txt: string) => this.sendMessage(r[0], txt)
      }))
    }).catch(err => this.emit('error', err))
  }

  /**
   * Attest the `subject_address`
   * @returns attestor address
   */
  createAttestation(subject_address: string, profile: PlainObject<NonFunc>) {
    return new Promise<any>((resolve, rejects) => {
      if (!this.core) throw new Error('Bot not ready')
      const callbacks = this.core!.composer.getSavingCallbacks({
        ifNotEnoughFunds: rejects,
        ifError: rejects,
        ifOk: (joint: any) => { // https://api.byteball.co/joint/oj8yEksX9Ubq7lLc+p6F2uyHUuynugeVq4+ikT67X6E=
          this.core!.network.broadcastJoint(joint)
          resolve(joint.unit.unit)
        }
      })

      this.core!.composer.composeAttestationJoint(
        this.address, // attestor address
        trimTrailingSpace(subject_address), // address of the person being attested (subject)
        profile,                            // attested profile
        this.core!.wallet.signer,
        callbacks
      )
    })
  }

  sendMessage(to_address: string, message: string) {
    if (!this.core) throw new Error('Bot not ready')
    this.core.device.sendMessageToDevice(to_address, 'text', message)
  }

  /**
   * @param text_or_amount is callback that must return a string which will be sended @to_address
   * @param address where the payment should be send
   * @arg message is a tagged template literals for transforming number into "send-link"
   */
  requestPayment(
    to_address: string,
    text_or_amount: ((message: TaggedTemplateLiterals) => string) | number,
    address?: string | string[] // TODO: support {user1: addr1, user2:addr2}
  ) {
    if (!this.core) throw new Error('Bot not ready')

    const requestToBePayedTo = (addr: string[] | string) => {
      this.sendMessage(to_address, typeof text_or_amount === 'function' ? text_or_amount(
        transformExpression(
          (expr, _, length) => { // transform expr in `${expr}` to readable nominal
            if (Array.isArray(addr) && length !== addr.length) throw new Error('number of amount not equal to address')
            if (typeof expr === 'number') {
              if (expr < 1_000) return`${expr} bytes`
              else if (expr < 1_000_000) return`${expr / 1_000} KB`
              else if (expr < 1_000_000_000) return`${expr / 1_000_000} MB`
              else return`${expr / 1_000_000_000} GB`

            } else return expr
          },
          // add "Request Payments" URI link at the end of the message
          expr => expr.reduce(
            (acc, curr, idx) => `${acc}\n[nyaa](byteball:${Array.isArray(addr) ? addr[idx] : addr}?amount=${curr})`, ''
          )
        )
      ) : `[woof](byteball:${Array.isArray(addr) ? addr[0] : addr}?amount=${text_or_amount})`)
    }

    if (!address) this.core.wallet.readSingleAddress(bot_address => requestToBePayedTo(bot_address))
    else requestToBePayedTo(address)
  }

  sendPayment(recipient_address: string, amount: number) {
    if (!this.core) throw new Error('Bot not ready')
    this.core.wallet.issueChangeAddressAndSendPayment(null, amount, trimTrailingSpace(recipient_address), undefined,
      (err: Error, unit: number) => this.payment.emit('send', unit, err)
    )
  }

  private getPaymentDetails(selector: string[], units: string[]) {
    return new Promise<PlainObject<string | number>>(resolve => {
      this.db.query(`SELECT ${selector.join(',')} FROM outputs
        WHERE unit IN(?)`, [units],
        (rows: PlainObject<any>[]) => rows.forEach(row => { // WARNING: has potential for duplicated messages
          if (row.address !== this.address) {
            if (row.asset !== null) this.payment.emit('reject', row.address, 'Received payment in wrong asset')
            else resolve(row)
          }
        })
      )
    })
  }

  private async init() {
    /// use of `await import` is for module thaat immediately run a service 😓
    this.core = {
      wallet: await import('headless-byteball') as Wallet,
      device: await import('byteballcore/device') as Device,
      composer: await import('byteballcore/composer'),
      network: await import('byteballcore/network')
    }
    const eventBus = require('byteballcore/event_bus')
    return new Promise<EventEmitter>(async resolve => {
      eventBus.once('headless_wallet_ready', () => {
        this.core!.wallet.setupChatEventHandlers()
        this.core!.wallet.readFirstAddress(address => {
          this.address = address
          this.emit('ready', this.core!.device)
          resolve(eventBus)
        })
      })
    })
  }
}
