// composables/useRoleSwitcher.ts
import { useAuth } from '~~/composables/useAuth'

export interface Role {
  name: string
  path: string
  icon: string
}

export const useRoleSwitcher = () => {
  const { user } = useAuth()
  const route = useRoute()

  const currentPath = computed(() => {
    const path = route.path
    if (path.startsWith('/admin')) return '/admin'
    if (path.startsWith('/teacher')) return '/teacher'
    if (path.startsWith('/parent')) return '/parent'
    if (path.startsWith('/accountant')) return '/accountant'
    return '/'
  })

  const availableRoles = computed<Role[]>(() => {
    const roles: Role[] = []

    if (user.value?.isAdmin) {
      roles.push({
        name: 'Admin Dashboard',
        path: '/admin',
        icon: 'lucide:shield'
      })
    }

    if (user.value?.isTeacher) {
      roles.push({
        name: 'Teacher Dashboard',
        path: '/teacher',
        icon: 'lucide:graduation-cap'
      })
    }

    if (user.value?.isAccountant) {
      roles.push({
        name: 'Accountant Dashboard',
        path: '/accountant',
        icon: 'lucide:calculator'
      })
    }

    if (user.value?.isParent) {
      roles.push({
        name: 'Parent Dashboard',
        path: '/parent',
        icon: 'lucide:users'
      })
    }

    return roles
  })

  const hasMultipleRoles = computed(() => availableRoles.value.length > 1)

  const currentRoleName = computed(() => {
    const current = availableRoles.value.find(r => r.path === currentPath.value)
    return current?.name || 'Dashboard'
  })

  const currentRoleIcon = computed(() => {
    const current = availableRoles.value.find(r => r.path === currentPath.value)
    return current?.icon || 'lucide:layout-dashboard'
  })

  const switchRole = (path: string) => {
    navigateTo(path)
  }

  return {
    availableRoles,
    hasMultipleRoles,
    currentPath,
    currentRoleName,
    currentRoleIcon,
    switchRole
  }
}
