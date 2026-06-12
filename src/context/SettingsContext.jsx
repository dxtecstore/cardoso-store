import { createContext, useContext, useState, useEffect } from 'react'
import { getSettings, SETTINGS_DEFAULTS } from '../lib/settings'

const SettingsContext = createContext(SETTINGS_DEFAULTS)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(SETTINGS_DEFAULTS)

  async function reload() {
    try {
      const remote = await getSettings()
      setSettings({ ...SETTINGS_DEFAULTS, ...remote })
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
