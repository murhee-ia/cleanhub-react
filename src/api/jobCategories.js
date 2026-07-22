import api from './client'

export const jobCategoryKeys = {
  all: ['cleaning-job-categories'],
  list: () => [...jobCategoryKeys.all, 'list'],
}

// Public endpoint — returns active categories as [{ id, name, slug }]. Cleaner
// profiles reference these by id (the update form submits an array of ids).
export async function getJobCategories() {
  const { data } = await api.get('/cleaning-job-categories')
  return data
}
