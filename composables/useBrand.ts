// composables/useBrand.ts
export const useBrand = () => {
  const cfg = useRuntimeConfig()
  const productName = cfg.public?.productName || 'SSync'
  const schoolName = useState<string>('school_name', () => '')

  const product = () => productName
  const school = () => schoolName.value
  const preferSchool = () => schoolName.value || productName

  /**
   * Get the app logo URL
   * Returns the app logo from settings or falls back to the default configured logo
   */
  const appLogo = () => {
    const state = useState<string>('app_logo_url', () => (cfg.public?.appLogo as string) || '/logo.png')
    return state.value
  }

  /**
   * Get the school logo URL
   * Returns the school logo from settings or falls back to the app logo
   */
  const schoolLogo = () => {
    const state = useState<string>('school_logo_url', () => '')
    return state.value || appLogo()
  }

  return { product, school, preferSchool, appLogo, schoolLogo }
}
