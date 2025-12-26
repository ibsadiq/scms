// plugins/init-app.client.ts
/**
 * This plugin runs on the client-side to initialize the app state
 * It fetches user data and applies school settings (primary color, secondary color, logo, etc.)
 */
import { useAuth } from '~~/composables/useAuth'
import { useSettings } from '~~/composables/useSettings'

export default defineNuxtPlugin(async () => {
  const { token, fetchUser, user } = useAuth()
  const { fetchSettings, applyPrimaryColor, applySettingsToDocument } = useSettings()
  const config = useRuntimeConfig()
  const productName = config.public?.productName || 'ScholAfric'
  

  // Only run on client-side and if user is authenticated
  if (process.client && token.value) {
    try {
      // Fetch user data if authenticated
      if (token.value && !user.value) {
        console.log('🔄 [INIT] Fetching user data...')
        await fetchUser()
        console.log('✅ [INIT] User data loaded:', (user.value as any)?.username)
      }

      // Check if settings were pre-loaded by app.html script
      const preloadedLogo = (window as any).__SCHOOL_LOGO_URL__
      const preloadedName = (window as any).__SCHOOL_NAME__
      const preloadedAppLogo = (window as any).__APP_LOGO_URL__


      if (preloadedLogo || preloadedName || preloadedAppLogo) {
        console.log('✅ [INIT] Using pre-loaded settings from app.html')

        // Initialize Vue state with pre-loaded values
        const schoolLogoUrl = useState('school_logo_url', () => preloadedLogo)
        const schoolName = useState('school_name', () => preloadedName || productName)
        const appLogoUrl = useState('app_logo_url', () => preloadedAppLogo || config.public.appLogo)

        schoolLogoUrl.value = preloadedLogo
        schoolName.value = preloadedName || productName
        appLogoUrl.value = preloadedAppLogo || config.public.appLogo

        console.log('🎨 [INIT] Applied pre-loaded branding:', {
          has_logo: !!preloadedLogo,
          school_name: preloadedName,
          has_app_logo: !!preloadedAppLogo,
        })
      }

      // Still fetch settings to ensure we have the latest data and update cache
      console.log('🔄 [INIT] Fetching latest school settings...')
      let settings = null

      // Try authenticated fetch first if user has token
      if (token.value) {
        const response = await fetchSettings(true)
        settings = response.data
      } else {
        // Use public fetch for non-authenticated users
        const response = await fetchSettingsPublic(true)
        settings = response.data
      }

      if (settings) {
        console.log('✅ [INIT] School settings loaded:', settings.school_name)

        // Apply all settings to document (colors, logo, school name)
        // This will override pre-loaded values if they differ
        applySettingsToDocument(settings)

        // Update app logo state if provided in settings
        const appLogoState = useState('app_logo_url', () => config.public.appLogo)
        if ((settings as any).app_logo_url || (settings as any).product_logo) {
          appLogoState.value = (settings as any).app_logo_url || (settings as any).product_logo
        }
        console.log('�� [INIT] Applied all settings:', {
          primary_color: settings.primary_color,
          secondary_color: settings.secondary_color,
          has_logo: !!settings.school_logo_url,
          school_name: settings.school_name,
          has_app_logo: !!(settings as any).app_logo_url || !!(settings as any).product_logo,
        })
      } else {
        console.log('⚠️ [INIT] No school settings found')
      }
    } catch (error) {
      console.error('❌ [INIT] Error initializing app:', error)
    }
  }
})
