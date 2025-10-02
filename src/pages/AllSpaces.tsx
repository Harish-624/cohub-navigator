import { useState, useMemo } from 'react';
import { Search, Filter, Grid3x3, Table as TableIcon, Download, Star, Phone, Globe as GlobeIcon, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { exportToCSV } from '@/lib/dataProcessing';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'table';

export default function AllSpaces() {
  const { spaces, loading } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const { toast } = useToast();

  const filteredSpaces = useMemo(() => {
    if (!searchQuery) return spaces;
    const query = searchQuery.toLowerCase();
    return spaces.filter(space =>
      space.name.toLowerCase().includes(query) ||
      space.address.toLowerCase().includes(query) ||
      space.city.toLowerCase().includes(query) ||
      space.country.toLowerCase().includes(query)
    );
  }, [spaces, searchQuery]);

  const handleExport = () => {
    try {
      const csv = exportToCSV(filteredSpaces);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `coworking-spaces-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: 'Export Successful',
        description: `Exported ${filteredSpaces.length} spaces to CSV`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting the data',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="All Spaces" description="Complete directory of co-working spaces" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="All Spaces" description="Complete directory of co-working spaces" />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search spaces, cities, or countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('table')}
          >
            <TableIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={filteredSpaces.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {filteredSpaces.length} of {spaces.length} spaces
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSpaces.map((space, idx) => (
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
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>{space.city}, {space.country}</span>
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
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Reviews</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSpaces.map((space, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{space.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{space.address}</TableCell>
                    <TableCell>{space.city}</TableCell>
                    <TableCell>{space.country}</TableCell>
                    <TableCell>
                      {space.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-warning text-warning" />
                          <span>{space.rating}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{space.reviews || '-'}</TableCell>
                    <TableCell>
                      {space.open_state && (
                        <Badge variant={space.open_state.toLowerCase().includes('open') ? 'default' : 'secondary'}>
                          {space.open_state}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {space.website && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={space.website} target="_blank" rel="noopener noreferrer">
                              <GlobeIcon className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {filteredSpaces.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Spaces Found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {searchQuery ? 'Try adjusting your search criteria' : 'Upload data to see spaces'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
