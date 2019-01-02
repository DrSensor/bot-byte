export interface IPairing {
  attempt(from_address: string, pairing_secret: string): void
  success(from_address: string, pairing_secret: string): void
  remove(from_address: string): void
}

export interface IPayment {
  send(unit: number, error: Error): void
  recieve(arrNewUnits: number[]): void // #new_private_payment
  confirm(arrUnits: number[]): void // #my_transactions_became_stable
  'private:recieve'(// #received_payment
    payer_device_address: string,
    assocAmountsByAsset: string,
    asset: string,
    message_counter: number,
    bToSharedAddress: string
  ): void
  'private:unhandle'(rowsLength: number): void // #unhandled_private_payments_left
}

export interface IDatabase {
  'upgrade:start': void
  'upgrade:finish': void
  'cordova:ready': void
}
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
