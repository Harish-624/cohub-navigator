import { Building2, MapPin, Globe, Star, Accessibility, Users } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { PageHeader } from '@/components/PageHeader';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { calculateDashboardStats } from '@/lib/dataProcessing';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function Dashboard() {
  const { spaces, loading } = useData();

  if (loading) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Overview of your co-working space data" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (spaces.length === 0) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Overview of your co-working space data" />
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Get started by uploading your first co-working space dataset to see analytics and insights.
            </p>
            <Button asChild>
              <Link to="/upload">Upload Data</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = calculateDashboardStats(spaces);

  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        description="Overview of your co-working space data"
        actions={
          <Button asChild variant="default">
            <Link to="/upload">Upload New Data</Link>
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Spaces"
          value={stats.totalSpaces.toLocaleString()}
          icon={Building2}
          description="Across all locations"
        />
        <StatsCard
          title="Cities Covered"
          value={stats.totalCities}
          icon={MapPin}
          description={`In ${stats.totalCountries} countries`}
        />
        <StatsCard
          title="Countries"
          value={stats.totalCountries}
          icon={Globe}
          description="Global coverage"
        />
        <StatsCard
          title="Average Rating"
          value={stats.averageRating}
          icon={Star}
          description={`${stats.spacesWithHighRating} with 4+ stars`}
        />
      </div>

      {/* Data Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Currently Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.spacesCurrentlyOpen}</div>
            <p className="text-xs text-muted-foreground mt-1">Spaces open now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Accessibility className="h-4 w-4" />
              Accessible Spaces
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.wheelchairAccessible}</div>
            <p className="text-xs text-muted-foreground mt-1">Wheelchair accessible</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Inclusive Spaces
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div>
                <div className="text-2xl font-bold text-primary">{stats.womenOwned}</div>
                <p className="text-xs text-muted-foreground">Women-owned</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{stats.lgbtqFriendly}</div>
                <p className="text-xs text-muted-foreground">LGBTQ+ friendly</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Cities by Spaces</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.topCities}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="city" tick={{ fontSize: 12 }} stroke="hsl(var(--foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribution by Country</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.countryDistribution.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ country, percent }: any) => `${country} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.countryDistribution.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button asChild variant="outline" className="w-full">
              <Link to="/upload">Upload New Data</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/spaces">View All Spaces</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/duplicates">Find Duplicates</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/cities">Browse by City</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
