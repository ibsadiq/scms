// composables/useSettings.ts
import { useApi } from '~~/composables/useApi'

export interface SchoolSettings {
  id?: number
  school_name: string
  address?: string
  city?: string
  state?: string
  contact_phone?: string
  contact_email?: string
  website?: string
  logo?: string
  logo_url?: string
  primary_color: string
  secondary_color?: string
  academic_year_start_month: number
  terms_per_year: number
  created_at?: string
  updated_at?: string
}

export const useSettings = () => {
  const { apiCall } = useApi()

  // Cached settings in localStorage
  const SETTINGS_CACHE_KEY = 'school_settings'
  const CACHE_DURATION = 1000 * 60 * 30 // 30 minutes

  /**
   * Get cached settings from localStorage
   */
  const getCachedSettings = (): SchoolSettings | null => {
    if (process.server) return null

    try {
      const cached = localStorage.getItem(SETTINGS_CACHE_KEY)
      if (!cached) return null

      const { data, timestamp } = JSON.parse(cached)
      const isExpired = Date.now() - timestamp > CACHE_DURATION

      if (isExpired) {
        localStorage.removeItem(SETTINGS_CACHE_KEY)
        return null
      }

      return data
    } catch {
      return null
    }
  }

  /**
   * Cache settings in localStorage
   */
  const cacheSettings = (settings: SchoolSettings) => {
    if (process.server) return

    try {
      localStorage.setItem(
        SETTINGS_CACHE_KEY,
        JSON.stringify({
          data: settings,
          timestamp: Date.now(),
        })
      )
    } catch {
      // Ignore localStorage errors
    }
  }

  /**
   * Fetch school settings from API (public - no auth required)
   */
  const fetchSettingsPublic = async (useCache = true) => {
    // Try cache first
    if (useCache) {
      const cached = getCachedSettings()
      if (cached) {
        return { data: cached, error: null }
      }
    }

    try {
      const config = useRuntimeConfig()
      const apiBaseUrl = config.public.apiBaseUrl || config.public.apiBase

      const data = await $fetch<SchoolSettings>(`${apiBaseUrl}/settings/`)

      if (data) {
        cacheSettings(data)
      }

      return { data, error: null }
    } catch (error: any) {
      console.error('❌ [useSettings] Error fetching public settings:', error)
      return { data: null, error }
    }
  }

  /**
   * Fetch school settings from API (authenticated)
   */
  const fetchSettings = async (useCache = true) => {
    // Try cache first
    if (useCache) {
      const cached = getCachedSettings()
      if (cached) {
        return { data: cached, error: null }
      }
    }

    const response = await apiCall<SchoolSettings>('/settings/')

    if (response.data) {
      cacheSettings(response.data)
    }

    return response
  }

  /**
   * Update school settings
   */
  const updateSettings = async (data: Partial<SchoolSettings>) => {
    const response = await apiCall<SchoolSettings>('/settings/1/', {
      method: 'PATCH',
      body: data,
    })

    if (response.data) {
      cacheSettings(response.data)
    }

    return response
  }

  /**
   * Upload school logo
   */
  const uploadLogo = async (file: File) => {
    const formData = new FormData()
    formData.append('logo', file)

    const response = await apiCall<{ message: string; logo_url: string }>(
      '/settings/upload_logo/',
      {
        method: 'POST',
        body: formData,
      }
    )

    // Refresh settings after logo upload
    if (response.data) {
      await fetchSettings(false)
    }

    return response
  }

  /**
   * Remove school logo
   */
  const removeLogo = async () => {
    const response = await apiCall<{ message: string }>('/settings/remove_logo/', {
      method: 'POST',
    })

    // Refresh settings after logo removal
    if (response.data) {
      await fetchSettings(false)
    }

    return response
  }

  /**
   * Clear settings cache
   */
  const clearCache = () => {
    if (process.server) return
    localStorage.removeItem(SETTINGS_CACHE_KEY)
  }

  /**
   * Apply primary color to document
   */
  const applyPrimaryColor = (color: string) => {
    if (process.server) return

    const root = document.documentElement

    // Convert hex to OKLCH for consistent color application
    const oklch = hexToOklch(color)
    root.style.setProperty('--primary', oklch.light)
    root.style.setProperty('--primary-foreground', 'oklch(0.99 0 0)') // white text

    // Update dark mode styles
    const darkStyles = document.querySelector('.dark')
    if (darkStyles) {
      root.style.setProperty('--primary-dark', oklch.dark)
    }
  }

  const applySecondaryColor = (color: string) => {
    if (process.server) return
    const root = document.documentElement

    const oklch = hexToOklch(color)
    root.style.setProperty('--secondary', oklch.light)
    root.style.setProperty('--secondary-foreground', 'oklch(0.99 0 0)')

    const darkStyles = document.querySelector('.dark')
    if (darkStyles) {
      root.style.setProperty('--secondary-dark', oklch.dark)
    }
  }

  // New helper to apply multiple settings at once
  const applySettingsToDocument = (settings: Partial<SchoolSettings> & { app_logo_url?: string; product_logo?: string }) => {
    if (settings.primary_color) applyPrimaryColor(settings.primary_color)
    if (settings.secondary_color) applySecondaryColor(settings.secondary_color)
    if (settings.logo_url) {
      const logoState = useState('school_logo_url', () => settings.logo_url)
      logoState.value = settings.logo_url
    }
    if (settings.school_name) {
      const schoolNameState = useState('school_name', () => settings.school_name)
      schoolNameState.value = settings.school_name
    }
    // Apply app logo if provided
    if (settings.app_logo_url || settings.product_logo) {
      const appLogoState = useState<string>('app_logo_url', () => settings.app_logo_url || settings.product_logo || '')
      appLogoState.value = settings.app_logo_url || settings.product_logo || ''
    }
  }

  /**
   * Convert hex color to OKLCH format
   * Returns both light and dark mode values
   */
  const hexToOklch = (hex: string): { light: string; dark: string } => {
    // Parse hex color
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result || !result[1] || !result[2] || !result[3]) {
      return {
        light: 'oklch(0.42 0.12 264)', // default blue
        dark: 'oklch(0.65 0.15 264)'
      }
    }

    const r = parseInt(result[1], 16) / 255
    const g = parseInt(result[2], 16) / 255
    const b = parseInt(result[3], 16) / 255

    // Convert RGB to HSL (simplified approximation for hue)
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2
    const delta = max - min

    let h = 0
    if (delta !== 0) {
      if (max === r) {
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6
      } else if (max === g) {
        h = ((b - r) / delta + 2) / 6
      } else {
        h = ((r - g) / delta + 4) / 6
      }
    }

    const hue = Math.round(h * 360)
    const chroma = delta === 0 ? 0 : Math.min(0.15, delta * 0.2)
    const lightness = Math.max(0.35, Math.min(0.55, l * 0.9))

    return {
      light: `oklch(${lightness.toFixed(2)} ${chroma.toFixed(2)} ${hue})`,
      dark: `oklch(${Math.min(0.70, lightness + 0.2).toFixed(2)} ${chroma.toFixed(2)} ${hue})`
    }
  }

  return {
    fetchSettings,
    fetchSettingsPublic,
    updateSettings,
    uploadLogo,
    removeLogo,
    clearCache,
    applyPrimaryColor,
    applySecondaryColor,
    applySettingsToDocument
  }
}
