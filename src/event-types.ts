export interface IMessage {
  readonly from_address: string
  readonly text: string
  readonly count: number
  response(text: string): void
}

export interface IBot {
  init: void
  passphrase: void
  ready(device: Device): void
  message(message: IMessage): void
  error(error: Error): void
}

import conf from 'byteballcore/conf'
import constants from 'byteballcore/constants'
export interface IOption {
  testnet: boolean
  constants: typeof constants
  conf: typeof conf
}
