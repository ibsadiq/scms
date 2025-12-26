// utils/helpers.ts
export const formatDate = (date: string | Date) => {
  if (!date) return ''
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export const formatDateShort = (date: string | Date) => {
  // Same as formatDate for consistency
  return formatDate(date)
}

export const formatDateLong = (date: string | Date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export const getEventTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    exam: 'Examination',
    graduation: 'Graduation',
    holiday: 'Holiday',
    leave: 'Leave',
    other: 'Other',
  }
  return labels[type] || type
}

export const getEventTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    exam: 'bg-blue-100 text-blue-700',
    graduation: 'bg-purple-100 text-purple-700',
    holiday: 'bg-green-100 text-green-700',
    leave: 'bg-yellow-100 text-yellow-700',
    other: 'bg-gray-100 text-gray-700',
  }
  return colors[type] || colors.other
}