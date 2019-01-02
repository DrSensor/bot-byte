import {IOption, LIVENET, TESTNET} from './types'

const filterEnum = ($enum: PlainObject<any>, blacklist: string[] = []) => Object.keys($enum).reduce(
  (obj: PlainObject<string>, item: any) => {
    if (isNaN(item) && !blacklist.includes(item)) obj[item] = $enum[item]
    return obj
  }, {}
)

/**
 * This function do all necessary thing for merging the option
 * It make it possible to set `byteballcore/constants` and `bytballcore/conf` programatically
 */
export default function (option: Partial<IOption> = {}) {
  if (!option.constants) option.constants = {}
  if (!option.conf) option.conf = {}

  // default conf regardless LIVENET or TESTNET
  option.conf = {
    bServeAsHub: false,
    bLight: true
  }

  const conf_keys = ['hub', 'port']

  //#region begin merging option `conf` and `constants`
  if (option.testnet) {
    option.constants = {
      ...filterEnum(TESTNET, conf_keys),
      ...option.constants
    }
    option.conf = {
      port: 16611,
      hub: 'byteball.org/bb-test',
      ...option.conf
    }

    // @ts-ignore because this option not used either in bytbeallcore or headless-wallet
    option.constants.bTestnet = true
    /// Anything else❓

  } else { // if mainnet
    option.constants = {
      version: '1.0',
      alt: '1',
      ...filterEnum(LIVENET, conf_keys),
      ...option.constants
    }
    option.conf = {
      port: 6611,
      hub: 'byteball.org/bb',
      ...option.conf
    }
  }
  //#endregion

  // don't place this 👇 on top because it immediately print something upon require() 😓
  Object.assign(require('byteballcore/constants'), option.constants)
  Object.assign(require('byteballcore/conf'), option.conf)
}

export * from './types'
