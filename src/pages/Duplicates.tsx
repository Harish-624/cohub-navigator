import { useState, useMemo } from 'react';
import { Copy, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useData } from '@/contexts/DataContext';
import { detectDuplicates } from '@/lib/dataProcessing';
import { CoworkingSpace } from '@/types/coworking';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type DetectionMethod = 'place_id' | 'name_address' | 'coordinates';

export default function Duplicates() {
  const { spaces, loading, refreshData } = useData();
  const [method, setMethod] = useState<DetectionMethod>('place_id');
  const [scanning, setScanning] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<CoworkingSpace[][]>([]);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const { toast } = useToast();

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      const groups = detectDuplicates(spaces, method);
      setDuplicateGroups(groups);
      setScanning(false);
      toast({
        title: 'Scan Complete',
        description: `Found ${groups.length} duplicate ${groups.length === 1 ? 'group' : 'groups'}`,
      });
    }, 1000);
  };

  const handleRemoveDuplicates = async (group: CoworkingSpace[], keepFirst: boolean) => {
    const rowsToRemove = keepFirst 
      ? group.slice(1).filter(s => s.row_number).map(s => s.row_number!) 
      : group.filter(s => s.row_number).map(s => s.row_number!);
    
    if (rowsToRemove.length === 0) {
      toast({
        title: '✗ Cannot remove rows',
        description: 'No row numbers available for deletion',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setRemoving(true);
      toast({
        title: '⏳ Removing duplicates...',
        description: 'Processing your request',
      });

      await api.deleteRows(rowsToRemove);
      
      toast({
        title: '✓ Success!',
        description: `Removed ${rowsToRemove.length} duplicate${rowsToRemove.length > 1 ? 's' : ''}`,
      });

      // Refresh data and re-scan
      await refreshData();
      const newGroups = detectDuplicates(spaces, method);
      setDuplicateGroups(newGroups);
    } catch (error) {
      toast({
        title: '✗ Failed to remove duplicates',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setRemoving(false);
    }
  };

  const handleClearAllDuplicates = async () => {
    // Collect all row numbers except the first (original) from each group
    const allDuplicateRows: number[] = [];
    

    duplicateGroups.forEach(group => {
      const rowsToRemove = group.slice(1).filter(s => s.row_number).map(s => s.row_number!);
      allDuplicateRows.push(...rowsToRemove);
    });
    
    if (allDuplicateRows.length === 0) {
      toast({
        title: '✗ Cannot remove rows',
        description: 'No row numbers available for deletion',
        variant: 'destructive',
      });
      setShowClearDialog(false);
      return;
    }
    
    try {
      setRemoving(true);
      setShowClearDialog(false);
      console.log('Duplicate Groups:', duplicateGroups);
      toast({
        title: '⏳ Removing all duplicates...',
        description: `Deleting ${allDuplicateRows.length} duplicate entries`,
      });

      await api.deleteRows(allDuplicateRows);
      
      toast({
        title: '✓ Success!',
        description: `Removed ${allDuplicateRows.length} duplicate${allDuplicateRows.length > 1 ? 's' : ''} from ${duplicateGroups.length} groups`,
      });

      // Refresh data and clear results
      await refreshData();
      setDuplicateGroups([]);
    } catch (error) {
      toast({
        title: '✗ Failed to remove duplicates',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setRemoving(false);
    }
  };

  const totalDuplicates = useMemo(() => {
    return duplicateGroups.reduce((sum, group) => sum + group.length, 0);
  }, [duplicateGroups]);
  
  const totalDuplicatesToRemove = useMemo(() => {
    return duplicateGroups.reduce((sum, group) => sum + Math.max(0, group.length - 1), 0);
  }, [duplicateGroups]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Duplicates Management" description="Detect and manage duplicate entries" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Duplicates Management" description="Detect and manage duplicate entries" />

      {/* Scan Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Duplicate Detection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Detection Method</Label>
            <RadioGroup value={method} onValueChange={(value) => setMethod(value as DetectionMethod)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="place_id" id="place_id" />
                <Label htmlFor="place_id" className="font-normal cursor-pointer">
                  <div>
                    <div className="font-medium">By Place ID</div>
                    <div className="text-xs text-muted-foreground">Exact matches using unique place identifiers</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="name_address" id="name_address" />
                <Label htmlFor="name_address" className="font-normal cursor-pointer">
                  <div>
                    <div className="font-medium">By Name + Address</div>
                    <div className="text-xs text-muted-foreground">Fuzzy matching on name and address fields</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="coordinates" id="coordinates" />
                <Label htmlFor="coordinates" className="font-normal cursor-pointer">
                  <div>
                    <div className="font-medium">By Coordinates</div>
                    <div className="text-xs text-muted-foreground">Find nearby locations using GPS coordinates</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button 
            onClick={handleScan} 
            disabled={scanning || spaces.length === 0}
            className="w-full sm:w-auto"
          >
            {scanning ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                Scanning...
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Scan for Duplicates
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {duplicateGroups.length > 0 && (
        <>
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Scan Results</h3>
                  <p className="text-sm text-muted-foreground">
                    Found <strong>{totalDuplicates} potential duplicates</strong> in <strong>{duplicateGroups.length} groups</strong>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowClearDialog(true)}
                    disabled={removing}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Duplicates
                  </Button>
                  <Button variant="outline" onClick={() => setDuplicateGroups([])}>
                    Close Results
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {duplicateGroups.map((group, groupIdx) => (
              <Card key={groupIdx}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Duplicate Group {groupIdx + 1}
                      <Badge variant="secondary" className="ml-2">
                        {group.length} entries
                      </Badge>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.map((space, spaceIdx) => (
                      <Card key={spaceIdx} className="border-2">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-sm line-clamp-1">{space.name}</h4>
                            {spaceIdx === 0 && (
                              <Badge variant="default" className="text-xs">Original</Badge>
                            )}
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Address:</span>
                              <p className="line-clamp-2">{space.address}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">City:</span>
                              <span>{space.city}</span>
                            </div>
                            {space.rating && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Rating:</span>
                                <span>{space.rating} ⭐</span>
                              </div>
                            )}
                            {space.place_id && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Place ID:</span>
                                <span className="font-mono text-xs">{space.place_id.slice(0, 12)}...</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleRemoveDuplicates(group, true)}
                      disabled={removing}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Keep First
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleRemoveDuplicates(group, false)}
                      disabled={removing}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {!scanning && duplicateGroups.length === 0 && spaces.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Copy className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Scan Results</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Click "Scan for Duplicates" to detect potential duplicate entries in your database
            </p>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium mb-2">About Duplicate Detection</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• <strong>Place ID:</strong> Most accurate method using unique identifiers</li>
                <li>• <strong>Name + Address:</strong> Good for finding similar entries with slight variations</li>
                <li>• <strong>Coordinates:</strong> Useful for finding spaces in the same physical location</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clear All Duplicates Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Duplicates?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                This action will permanently delete <strong>{totalDuplicatesToRemove} duplicate entries</strong> from your database.
              </p>
              <p>
                From each of the <strong>{duplicateGroups.length} duplicate groups</strong>, the first entry (marked as "Original") will be kept, and all other duplicates will be removed.
              </p>
              <p className="text-destructive font-medium">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearAllDuplicates}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {totalDuplicatesToRemove} Duplicates
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
