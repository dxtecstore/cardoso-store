import { createContext, useContext, useState, useEffect } from 'react'
import { getSettings, SETTINGS_DEFAULTS } from '../lib/settings'
import { STORE_WHATSAPP } from '../lib/whatsapp'

const SettingsContext = createContext(SETTINGS_DEFAULTS)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(SETTINGS_DEFAULTS)

  async function reload() {
    try {
      const remote = await getSettings()
      setSettings({ ...SETTINGS_DEFAULTS, ...remote, whatsapp: STORE_WHATSAPP })
    } catch (_) { /* usa defaults */ }
  }

  useEffect(() => { reload() }, [])

  return (
    <SettingsContext.Provider value={{ settings, reload }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
