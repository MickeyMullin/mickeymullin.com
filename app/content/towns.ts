// On-site service area. Drives the visible town list, JSON-LD areaServed and llms.txt.
// The first town is home base.

export const STATE = 'New Hampshire'
export const REGION = 'Southern New Hampshire'

export const TOWNS = [
  'Manchester',
  'Bedford',
  'Goffstown',
  'Hooksett',
  'Londonderry',
  'Derry',
  'Merrimack',
  'Nashua',
  'Concord',
] as const

export const HOME_TOWN = TOWNS[0]
