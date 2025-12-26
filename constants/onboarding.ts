import { School, User, Palette, CheckCircle } from 'lucide-vue-next'

export enum OnboardingStep {
  SCHOOL_INFO = 1,
  ADMIN = 2,
  BRANDING = 3,
  COMPLETED = 4,
}

export const ONBOARDING_STEPS = [
  {
    step: OnboardingStep.SCHOOL_INFO,
    title: 'School Info',
    description: 'Basic school details',
    icon: School,
  },
  {
    step: OnboardingStep.ADMIN,
    title: 'Admin Account',
    description: 'Create admin user',
    icon: User,
  },
  {
    step: OnboardingStep.BRANDING,
    title: 'Branding',
    description: 'Logo & colors',
    icon: Palette,
  },
  {
    step: OnboardingStep.COMPLETED,
    title: 'Complete',
    description: 'Finish setup',
    icon: CheckCircle,
  },
]