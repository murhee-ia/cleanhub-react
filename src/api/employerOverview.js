import api from './client'

export const employerOverviewKeys = {
  all: ['employer-overview'],
  detail: (range) => [...employerOverviewKeys.all, range],
}

export async function getEmployerOverview(range = '30d') {
  const { data } = await api.get('/employer/overview', { params: { range } })
  return data
}
