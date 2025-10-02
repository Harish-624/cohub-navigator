import { useState, useMemo } from 'react';
import { MapPin, Search, Building2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useData } from '@/contexts/DataContext';
import { groupByCity } from '@/lib/dataProcessing';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export default function Cities() {
  const { spaces, loading } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const cities = useMemo(() => groupByCity(spaces), [spaces]);

  const filteredCities = useMemo(() => {
    if (!searchQuery) return cities;
    const query = searchQuery.toLowerCase();
    return cities.filter(city =>
      city.city.toLowerCase().includes(query) ||
      city.state?.toLowerCase().includes(query) ||
      city.country.toLowerCase().includes(query)
    );
  }, [cities, searchQuery]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Cities View" description="Browse co-working spaces by city" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Cities View" description="Browse co-working spaces by city" />

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cities, states, or countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredCities.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Cities Found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {searchQuery ? 'Try adjusting your search criteria' : 'Upload data to see cities'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredCities.length} {filteredCities.length === 1 ? 'city' : 'cities'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCities.map((city) => (
              <Link
                key={`${city.city}-${city.state}-${city.country}`}
                to={`/cities/${encodeURIComponent(city.city)}`}
                state={{ cityData: city }}
              >
                <Card className="group hover:shadow-card-hover hover:border-primary/50 transition-smooth cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-smooth">
                          {city.city}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {city.state && `${city.state}, `}{city.country}
                          </span>
                        </div>
                        {city.region && (
                          <p className="text-xs text-muted-foreground mt-1">Region: {city.region}</p>
                        )}
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                        <Building2 className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Spaces</span>
                        <span className="text-2xl font-bold text-primary">{city.totalSpaces}</span>
                      </div>
                    </div>

                    {/* Preview thumbnails */}
                    <div className="mt-4 flex gap-2">
                      {city.spaces.slice(0, 3).map((space, idx) => (
                        <div
                          key={idx}
                          className="flex-1 h-16 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground"
                        >
                          {space.thumbnail ? (
                            <img
                              src={space.thumbnail}
                              alt={space.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <Building2 className="h-6 w-6" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
