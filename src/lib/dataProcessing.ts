import { CoworkingSpace, CityData, CountryData, StateData, DashboardStats } from '@/types/coworking';
import _ from 'lodash';

export function groupByCity(spaces: CoworkingSpace[]): CityData[] {
  const grouped = _.groupBy(spaces, (space) => 
    `${space.city}-${space.state || ''}-${space.country}`
  );
  console.log('Grouped by city:', grouped);
  return Object.entries(grouped).map(([key, spacesList]) => {
    const firstSpace = spacesList[0];
    return {
      city: firstSpace.city,
      state: firstSpace.state,
      country: firstSpace.country,
      region: firstSpace.region,
      spaces: spacesList,
      totalSpaces: spacesList.length,
    };
  }).sort((a, b) => b.totalSpaces - a.totalSpaces);
}

export function groupByCountry(spaces: CoworkingSpace[]): CountryData[] {
  const byCountry = _.groupBy(spaces, 'country');

  return Object.entries(byCountry).map(([country, countrySpaces]) => {
    const byState = _.groupBy(countrySpaces, 'state');

    const states: StateData[] = Object.entries(byState).map(([state, stateSpaces]) => {
      const cities = groupByCity(stateSpaces);
      return {
        state: state || 'Unknown',
        country,
        cities,
        totalCities: cities.length,
        totalSpaces: stateSpaces.length,
      };
    });

    const allCities = groupByCity(countrySpaces);

    return {
      country,
      states: states.sort((a, b) => b.totalSpaces - a.totalSpaces),
      totalStates: states.length,
      totalCities: allCities.length,
      totalSpaces: countrySpaces.length,
    };
  }).sort((a, b) => b.totalSpaces - a.totalSpaces);
}

export function calculateDashboardStats(spaces: CoworkingSpace[]): DashboardStats {
  const cities = new Set(spaces.map(s => s.city)).size;
  const countries = new Set(spaces.map(s => s.country)).size;
  
  const ratingsWithValues = spaces.filter(s => s.rating && s.rating > 0);
  const averageRating = ratingsWithValues.length > 0
    ? _.meanBy(ratingsWithValues, 'rating')
    : 0;

  const spacesWithHighRating = spaces.filter(s => s.rating && s.rating >= 4).length;
  const spacesCurrentlyOpen = spaces.filter(s => 
    s.open_state?.toLowerCase().includes('open')
  ).length;

  const wheelchairAccessible = spaces.filter(s => 
    s.accessibility_features?.toLowerCase().includes('wheelchair')
  ).length;

  const womenOwned = spaces.filter(s => 
    s.from_business?.toLowerCase().includes('women-owned') ||
    s.amenities?.toLowerCase().includes('women-owned')
  ).length;

  const lgbtqFriendly = spaces.filter(s => 
    s.amenities?.toLowerCase().includes('lgbtq') ||
    s.from_business?.toLowerCase().includes('lgbtq')
  ).length;

  const cityGroups = groupByCity(spaces);
  const topCities = cityGroups
    .slice(0, 10)
    .map(c => ({ city: c.city, count: c.totalSpaces }));

  const countryGroups = groupByCountry(spaces);
  const countryDistribution = countryGroups
    .map(c => ({ country: c.country, count: c.totalSpaces }));

  return {
    totalSpaces: spaces.length,
    totalCities: cities,
    totalCountries: countries,
    averageRating: Number(averageRating.toFixed(1)),
    spacesWithHighRating,
    spacesCurrentlyOpen,
    wheelchairAccessible,
    womenOwned,
    lgbtqFriendly,
    topCities,
    countryDistribution,
  };
}

export function detectDuplicates(spaces: CoworkingSpace[], method: 'place_id' | 'name_address' | 'coordinates'): CoworkingSpace[][] {
  switch (method) {
    case 'place_id':
      return detectByPlaceId(spaces);
    case 'name_address':
      return detectByNameAddress(spaces);
    case 'coordinates':
      return detectByCoordinates(spaces);
    default:
      return [];
  }
}

function detectByPlaceId(spaces: CoworkingSpace[]): CoworkingSpace[][] {
  const grouped = _.groupBy(
    spaces.filter(s => s.place_id),
    'place_id'
  );
  
  return Object.values(grouped).filter(group => group.length > 1);
}

function detectByNameAddress(spaces: CoworkingSpace[]): CoworkingSpace[][] {
  const normalized = spaces.map(space => ({
    ...space,
    normalizedName: typeof space.name === 'string'
      ? space.name.toLowerCase().trim()
      : String(space.name || '').toLowerCase().trim(),
    normalizedAddress: typeof space.address === 'string'
      ? space.address.toLowerCase().trim()
      : String(space.address || '').toLowerCase().trim(),
  }));

  const grouped = _.groupBy(
    normalized,
    s => `${s.normalizedName}-${s.normalizedAddress}`
  );

  return Object.values(grouped).filter(group => group.length > 1);
}


function detectByCoordinates(spaces: CoworkingSpace[], threshold = 0.0001): CoworkingSpace[][] {
  const withCoords = spaces.filter(s => s.latitude && s.longitude);
  const duplicateGroups: CoworkingSpace[][] = [];
  const processed = new Set<number>();

  withCoords.forEach((space, index) => {
    if (processed.has(index)) return;

    const group: CoworkingSpace[] = [space];
    processed.add(index);

    withCoords.forEach((otherSpace, otherIndex) => {
      if (otherIndex === index || processed.has(otherIndex)) return;

      const latDiff = Math.abs((space.latitude || 0) - (otherSpace.latitude || 0));
      const lonDiff = Math.abs((space.longitude || 0) - (otherSpace.longitude || 0));

      if (latDiff < threshold && lonDiff < threshold) {
        group.push(otherSpace);
        processed.add(otherIndex);
      }
    });

    if (group.length > 1) {
      duplicateGroups.push(group);
    }
  });

  return duplicateGroups;
}

export function exportToCSV(spaces: CoworkingSpace[]): string {
  if (spaces.length === 0) return '';

  const headers = Object.keys(spaces[0]);
  const rows = spaces.map(space => 
    headers.map(header => {
      const value = space[header as keyof CoworkingSpace];
      return typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}
