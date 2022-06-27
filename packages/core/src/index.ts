import connectWallet from './connect'
import disconnectWallet from './disconnect'
import setChain from './chain'
import { state } from './store'
import {
  addChains,
  setWalletModules,
  updateAccountCenter,
  setLocale
} from './store/actions'
import { reset$ } from './streams'
import { validateInitOptions } from './validation'
import initI18N from './i18n'

import type { InitOptions, OnboardAPI } from './types'
import { APP_INITIAL_STATE } from './constants'
import { internalState } from './internals'
import updateBalances from './updateBalances'

export * from './provider'
export * from './store/actions'
export * from './streams'

export * from './provider'
export * from './store/actions'
export * from './streams'

const API = {
  connectWallet,
  disconnectWallet,
  setChain,
  state: {
    get: state.get,
    select: state.select,
    actions: {
      setWalletModules,
      setLocale,
      updateBalances
    }
  }
}

export type {
  InitOptions,
  OnboardAPI,
  ConnectOptions,
  DisconnectOptions,
  WalletState,
  ConnectedChain
} from './types'

export type { EIP1193Provider } from '@web3-onboard/common'

function init(options: InitOptions): OnboardAPI {
  if (typeof window === 'undefined') return API

  if (options) {
    const error = validateInitOptions(options)

    if (error) {
      throw error
    }
  }

  const { wallets, chains, appMetadata = null, i18n, accountCenter } = options

  initI18N(i18n)
  addChains(chains)

  const { device, svelteInstance } = internalState

  // update accountCenter
  if (typeof accountCenter !== 'undefined') {
    let accountCenterUpdate

    if (device.type === 'mobile' && accountCenter.mobile) {
      accountCenterUpdate = {
        ...APP_INITIAL_STATE.accountCenter,
        ...accountCenter.mobile
      }
    } else if (accountCenter.desktop) {
      accountCenterUpdate = {
        ...APP_INITIAL_STATE.accountCenter,
        ...accountCenter.desktop
      }
    }

    updateAccountCenter(accountCenterUpdate)
  }

  if (svelteInstance) {
    // if already initialized, need to cleanup old instance
    console.warn('Re-initializing Onboard and resetting back to initial state')
    reset$.next()
  }

  // const app = svelteInstance || mountApp()

  // update metadata and app internal state
  internalState.appMetadata = appMetadata
  // internalState.svelteInstance = app

  setWalletModules(wallets)

  return API
}

export default init
