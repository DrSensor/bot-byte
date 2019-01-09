export enum TESTNET {
  //#region conf
  hub = 'byteball.org/bb-test',
  port = 16611,
  //#endregion

  //#region constants
  version = '1.0t',
  alt = '2',
  GENESIS_UNIT = 'TvqutGPz3T4Cs6oiChxFlclY92M2MvCvfXR5/FETato=',
  BLACKBYTES_ASSET = 'LUQu5ik4WLfCrr8OwXezqBa+i3IlZLqxj2itQZQm8WY=',
  minCoreVersion = '0.2.89',
  witnessedLevelMustNotRetreatUpgradeMci = 684000,
  spendUnconfirmedUpgradeMci = 589000,
  branchedMinMcWlUpgradeMci = 593000,
  otherAddressInDefinitionUpgradeMci = 602000,
  attestedInDefinitionUpgradeMci = 616000,
  altBranchByBestParentUpgradeMci = 642000,
  //#endregion

  //#region botbyte
  explorer = 'https://testnetexplorer.byteball.org/#',
  //#endregion
}

export enum LIVENET {
  //#region conf
  hub = 'byteball.org/bb',
  port = 6611,
  //#endregion

  //#region constants
  GENESIS_UNIT = 'oj8yEksX9Ubq7lLc+p6F2uyHUuynugeVq4+ikT67X6E=',
  BLACKBYTES_ASSET = 'qO2JsiuDMh/j+pqJYZw3u82O71WjCDf0vTNvsnntr8o=',
  minCoreVersion = '0.2.92',
  witnessedLevelMustNotRetreatUpgradeMci = 1400000,
  spendUnconfirmedUpgradeMci = 2909000,
  branchedMinMcWlUpgradeMci = spendUnconfirmedUpgradeMci,
  otherAddressInDefinitionUpgradeMci = spendUnconfirmedUpgradeMci,
  attestedInDefinitionUpgradeMci = spendUnconfirmedUpgradeMci,
  altBranchByBestParentUpgradeMci = 3009824,
  //#endregion

  //#region botbyte
  explorer = 'https://explorer.byteball.org/#',
  //#endregion
}

// #region Database config
/**
 * @see https://github.com/byteball/byteballcore/blob/master/conf.js#L105-L116
 */
interface IDatabase {
  max_connections?: number
}

interface IMySql extends IDatabase {
  name: string
  user: string
  host: string
}

interface ISqlite extends IDatabase {
  filename: string
}
// #endregion

interface IConfWallet {
  hub: string
  deviceName: string
  permanent_pairing_secret: string
  control_addresses: string[]
  payout_address: string
  KEYS_FILENAME: string
}

/**
 * @see  https://github.com/byteball/byteballcore/blob/master/conf.js
 */
export interface IConf extends IConfWallet {
  port: number | null
  myUrl: string
  bServeAsHub: boolean
  bLight: boolean
  bug_sink_url: string
  bug_sink_email: string
  bugs_from_email: string
  socksHost: string
  socksPort: number
  socksLocalDNS: boolean
  WS_PROTOCOL: string
  bWantNewPeers: boolean
  bIgnoreUnpairRequests: boolean
  storage: 'sqlite' | 'mysql'
  program: string
  program_version: string
  database: IMySql | ISqlite
}

/**
 * @see https://github.com/byteball/byteballcore/blob/master/constants.js
 */
export interface IConstants {
  version: TESTNET.version | string
  alt: TESTNET.alt | string
  GENESIS_UNIT: TESTNET.GENESIS_UNIT | LIVENET.GENESIS_UNIT
  BLACKBYTES_ASSET: TESTNET.BLACKBYTES_ASSET | LIVENET.BLACKBYTES_ASSET
  minCoreVersion: TESTNET.minCoreVersion | LIVENET.minCoreVersion
  witnessedLevelMustNotRetreatUpgradeMci: TESTNET.witnessedLevelMustNotRetreatUpgradeMci | LIVENET.witnessedLevelMustNotRetreatUpgradeMci
  spendUnconfirmedUpgradeMci: TESTNET.spendUnconfirmedUpgradeMci | LIVENET.spendUnconfirmedUpgradeMci
  branchedMinMcWlUpgradeMci: TESTNET.branchedMinMcWlUpgradeMci | LIVENET.branchedMinMcWlUpgradeMci
  otherAddressInDefinitionUpgradeMci: TESTNET.otherAddressInDefinitionUpgradeMci | LIVENET.otherAddressInDefinitionUpgradeMci
  attestedInDefinitionUpgradeMci: TESTNET.attestedInDefinitionUpgradeMci | LIVENET.attestedInDefinitionUpgradeMci
  altBranchByBestParentUpgradeMci: TESTNET.altBranchByBestParentUpgradeMci | LIVENET.altBranchByBestParentUpgradeMci
}

export interface IOption {
  testnet: boolean
  conf: Partial<IConf>
  constants: Partial<IConstants>
}
