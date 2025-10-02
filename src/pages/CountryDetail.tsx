import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Building2, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CountryData } from '@/types/coworking';
import { Badge } from '@/components/ui/badge';

export default function CountryDetail() {
  const { countryName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const countryData = location.state?.countryData as CountryData | undefined;

  if (!countryData) {
    return (
      <div>
        <Button variant="ghost" onClick={() => navigate('/countries')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Countries
        </Button>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Country Not Found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Unable to load country data. Please return to the countries list.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          Home
        </Button>
        <ChevronRight className="h-4 w-4" />
        <Button variant="ghost" size="sm" onClick={() => navigate('/countries')}>
          Countries
        </Button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{countryData.country}</span>
      </div>

      <PageHeader
        title={countryData.country}
        description={`${countryData.totalStates} states/regions, ${countryData.totalCities} cities, ${countryData.totalSpaces} spaces`}
      />

      <div className="mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">States/Regions</p>
                <p className="text-2xl font-bold text-foreground">{countryData.totalStates}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Cities</p>
                <p className="text-2xl font-bold text-foreground">{countryData.totalCities}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Spaces</p>
                <p className="text-2xl font-bold text-primary">{countryData.totalSpaces}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-semibold mb-4">States & Regions</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {countryData.states.map((state) => (
          <Card key={state.state} className="hover:shadow-card-hover transition-smooth">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                {state.state}
              </h3>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Cities</span>
                  </div>
                  <span className="text-lg font-semibold text-foreground">{state.totalCities}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>Spaces</span>
                  </div>
                  <span className="text-xl font-bold text-primary">{state.totalSpaces}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground mb-2">Top Cities:</p>
                <div className="flex flex-wrap gap-1">
                  {state.cities.slice(0, 3).map((city) => (
                    <Badge key={city.city} variant="secondary">
                      {city.city} ({city.totalSpaces})
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
