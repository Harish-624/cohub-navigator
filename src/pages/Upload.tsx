import { useState } from 'react';
import { Upload, MapPin, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/contexts/DataContext';
import Papa from 'papaparse';

export default function UploadPage() {
  const { toast } = useToast();
  const { refreshData } = useData();
  const [loading, setLoading] = useState(false);

  // CSV Upload State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);

  // Single Location State
  const [singleLocation, setSingleLocation] = useState({
    city: '',
    region: '',
    state: '',
    country: '',
    search_query: ''
  });

  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: '⚠️ Invalid File',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      });
      return;
    }

    setCsvFile(file);

    // Parse CSV for preview
    Papa.parse(file, {
      header: true,
      preview: 5,
      complete: (results) => {
        setCsvPreview(results.data);
      }
    });
  };

  const handleCsvSubmit = async () => {
    if (!csvFile) {
      toast({
        title: '⚠️ Invalid Input',
        description: 'Please select a CSV file',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const toastId = toast({
      title: '⏳ Workflow Started',
      description: 'Processing your data...',
      duration: Infinity,
    });

    try {
      // Parse full CSV
      Papa.parse(csvFile, {
        header: true,
        complete: async (results) => {
          const cities = results.data
            .filter((row: any) => row.city && row.state && row.country)
            .map((row: any) => ({
              city: row.city,
              state: row.state,
              country: row.country,
              region: row.region || '',
              search_query: row.search_query || `coworking space in ${row.city}, ${row.state}`
            }));

          try {
            const response = await api.processData({ cities });
            
            toastId.dismiss();
            toast({
              title: '✓ Success!',
              description: `Processed ${response.processed || cities.length} coworking spaces`,
              variant: 'default',
            });

            // Fetch updated data
            await handleFetchData();
            
            // Reset form
            setCsvFile(null);
            setCsvPreview([]);
          } catch (error: any) {
            toastId.dismiss();
            toast({
              title: '✗ Processing Failed',
              description: error.message,
              variant: 'destructive',
              duration: 10000,
            });
          } finally {
            setLoading(false);
          }
        }
      });
    } catch (error: any) {
      toastId.dismiss();
      toast({
        title: '✗ Processing Failed',
        description: error.message,
        variant: 'destructive',
        duration: 10000,
      });
      setLoading(false);
    }
  };

  const handleSingleSubmit = async () => {
    if (!singleLocation.city || !singleLocation.state || !singleLocation.country) {
      toast({
        title: '⚠️ Invalid Input',
        description: 'Please provide city, state, and country',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const toastId = toast({
      title: '⏳ Workflow Started',
      description: 'Processing your data...',
      duration: Infinity,
    });

    try {
      const searchQuery = singleLocation.search_query || 
        `coworking space in ${singleLocation.city}, ${singleLocation.state}`;

      const response = await api.processData({
        city: singleLocation.city,
        region: singleLocation.region,
        state: singleLocation.state,
        country: singleLocation.country,
        search_query: searchQuery
      });

      toastId.dismiss();
      toast({
        title: '✓ Success!',
        description: `Processed coworking spaces for ${singleLocation.city}`,
        variant: 'default',
      });

      // Fetch updated data
      await handleFetchData();

      // Reset form
      setSingleLocation({
        city: '',
        region: '',
        state: '',
        country: '',
        search_query: ''
      });
    } catch (error: any) {
      toastId.dismiss();
      toast({
        title: '✗ Processing Failed',
        description: error.message,
        variant: 'destructive',
        duration: 10000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDefault = async () => {
    setLoading(true);
    const toastId = toast({
      title: '⏳ Workflow Started',
      description: 'Loading default data...',
      duration: Infinity,
    });

    try {
      const response = await api.processData({ command: 'start' });

      toastId.dismiss();
      toast({
        title: '✓ Success!',
        description: response.message || 'Default data loaded successfully',
        variant: 'default',
      });

      // Fetch updated data
      await handleFetchData();
    } catch (error: any) {
      toastId.dismiss();
      toast({
        title: '✗ Processing Failed',
        description: error.message,
        variant: 'destructive',
        duration: 10000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFetchData = async () => {
    const fetchToast = toast({
      title: '🔄 Fetching coworking spaces...',
      description: 'Loading data from database',
      duration: Infinity,
    });

    try {
      const spaces = await api.fetchSpaces();
      
      fetchToast.dismiss();
      toast({
        title: '✓ Data Loaded',
        description: `Loaded ${spaces.length} spaces from database`,
        variant: 'default',
        duration: 3000,
      });

      // Refresh the data context
      await refreshData();
    } catch (error: any) {
      fetchToast.dismiss();
      toast({
        title: '✗ Fetch Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Data</h1>
        <p className="text-muted-foreground mt-2">
          Process coworking space data through multiple input methods
        </p>
      </div>

      <Tabs defaultValue="csv" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="csv">
            <Upload className="w-4 h-4 mr-2" />
            CSV Upload
          </TabsTrigger>
          <TabsTrigger value="single">
            <MapPin className="w-4 h-4 mr-2" />
            Single Location
          </TabsTrigger>
          <TabsTrigger value="default">
            <Database className="w-4 h-4 mr-2" />
            Load Default
          </TabsTrigger>
        </TabsList>

        <TabsContent value="csv" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">📤 CSV Upload (Bulk Processing)</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="csv-file">Upload CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleCsvChange}
                  disabled={loading}
                  className="mt-2"
                />
              </div>

              {csvPreview.length > 0 && (
                <div>
                  <Label>Preview (First 5 rows)</Label>
                  <div className="mt-2 border rounded-md overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          {Object.keys(csvPreview[0]).map((key) => (
                            <th key={key} className="px-4 py-2 text-left font-medium">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.map((row, idx) => (
                          <tr key={idx} className="border-t">
                            {Object.values(row).map((val: any, i) => (
                              <td key={i} className="px-4 py-2">
                                {val}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="bg-muted/50 p-4 rounded-md">
                <p className="text-sm font-medium mb-2">Required Columns:</p>
                <ul className="text-sm space-y-1">
                  <li>• <strong>city</strong> - City name (e.g., "Manhattan")</li>
                  <li>• <strong>state</strong> - State/Province (e.g., "NY")</li>
                  <li>• <strong>country</strong> - Country name (e.g., "USA")</li>
                  <li>• <strong>region</strong> - Region (optional, e.g., "Downtown")</li>
                  <li>• <strong>search_query</strong> - Custom query (optional)</li>
                </ul>
              </div>

              <Button 
                onClick={handleCsvSubmit} 
                disabled={!csvFile || loading}
                className="w-full"
              >
                {loading ? 'Processing...' : 'Process CSV'}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="single" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">📍 Single Location (One City Search)</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="e.g., Manhattan"
                  value={singleLocation.city}
                  onChange={(e) => setSingleLocation({ ...singleLocation, city: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="region">Region (optional)</Label>
                <Input
                  id="region"
                  placeholder="e.g., Downtown, Midtown"
                  value={singleLocation.region}
                  onChange={(e) => setSingleLocation({ ...singleLocation, region: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  placeholder="e.g., NY, California"
                  value={singleLocation.state}
                  onChange={(e) => setSingleLocation({ ...singleLocation, state: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  placeholder="e.g., USA, UK"
                  value={singleLocation.country}
                  onChange={(e) => setSingleLocation({ ...singleLocation, country: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="search_query">Search Query (optional)</Label>
                <Input
                  id="search_query"
                  placeholder="Auto-generated or custom"
                  value={singleLocation.search_query}
                  onChange={(e) => setSingleLocation({ ...singleLocation, search_query: e.target.value })}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to auto-generate: "coworking space in {singleLocation.city || 'City'}, {singleLocation.state || 'State'}"
                </p>
              </div>

              <Button 
                onClick={handleSingleSubmit} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Processing...' : 'Search Location'}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="default" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">📊 Load Default (From Google Sheets)</h3>
            
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-md">
                <p className="text-sm">
                  Fetches pre-configured coworking spaces from your Google Sheets database.
                  This will load all existing data and process it through the workflow.
                </p>
              </div>

              <Button 
                onClick={handleLoadDefault} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Loading...' : 'Load Existing Data'}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
