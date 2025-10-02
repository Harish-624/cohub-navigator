import { useMemo } from 'react';
import { Globe, MapPin, Building2, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { groupByCountry } from '@/lib/dataProcessing';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export default function Countries() {
  const { spaces, loading } = useData();

  const countries = useMemo(() => groupByCountry(spaces), [spaces]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Countries View" description="Browse co-working spaces by country" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Countries View" 
        description="Hierarchical view of co-working spaces by country, state, and city"
      />

      {countries.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Globe className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Upload data to see countries and their co-working spaces
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {countries.length} {countries.length === 1 ? 'country' : 'countries'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {countries.map((country) => (
              <Link
                key={country.country}
                to={`/countries/${encodeURIComponent(country.country)}`}
                state={{ countryData: country }}
              >
                <Card className="group hover:shadow-card-hover hover:border-primary/50 transition-smooth cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-smooth">
                          {country.country}
                        </h3>
                      </div>
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                        <Globe className="h-7 w-7" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>States/Regions</span>
                        </div>
                        <span className="text-lg font-semibold text-foreground">{country.totalStates}</span>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>Cities</span>
                        </div>
                        <span className="text-lg font-semibold text-foreground">{country.totalCities}</span>
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          <span>Total Spaces</span>
                        </div>
                        <span className="text-xl font-bold text-primary">{country.totalSpaces}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-sm text-primary group-hover:text-primary/80">
                        <span className="font-medium">View details</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
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
