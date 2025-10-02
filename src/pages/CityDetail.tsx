import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Phone, Globe as GlobeIcon } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CityData } from '@/types/coworking';

export default function CityDetail() {
  const { cityName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const cityData = location.state?.cityData as CityData | undefined;

  if (!cityData) {
    return (
      <div>
        <Button variant="ghost" onClick={() => navigate('/cities')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cities
        </Button>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">City Not Found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Unable to load city data. Please return to the cities list.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate('/cities')} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Cities
      </Button>

      <PageHeader
        title={cityData.city}
        description={`${cityData.state ? `${cityData.state}, ` : ''}${cityData.country}`}
      />

      <div className="mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Co-working Spaces</p>
                <p className="text-3xl font-bold text-primary">{cityData.totalSpaces}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {cityData.region && <span>Region: {cityData.region}</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cityData.spaces.map((space, idx) => (
          <Card key={idx} className="hover:shadow-card-hover transition-smooth">
            <CardContent className="p-6">
              {space.thumbnail && (
                <div className="mb-4 h-32 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={space.thumbnail}
                    alt={space.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1">
                {space.name}
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{space.address}</span>
                </div>

                {space.rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="text-sm font-medium">{space.rating}</span>
                    </div>
                    {space.reviews && (
                      <span className="text-xs text-muted-foreground">
                        ({space.reviews} reviews)
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {space.open_state && (
                  <Badge variant={space.open_state.toLowerCase().includes('open') ? 'default' : 'secondary'}>
                    {space.open_state}
                  </Badge>
                )}
                {space.phone && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`tel:${space.phone}`}>
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </a>
                  </Button>
                )}
                {space.website && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={space.website} target="_blank" rel="noopener noreferrer">
                      <GlobeIcon className="h-3 w-3 mr-1" />
                      Website
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
