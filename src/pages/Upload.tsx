import { useState, useCallback, useEffect } from 'react';
import { Upload as UploadIcon, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { CoworkingSpace, UploadMetadata } from '@/types/coworking';
import { saveSpaces, saveUpload } from '@/lib/db';
import { useData } from '@/contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { api, type UploadResponse, type UploadStatus } from '@/lib/api';

export default function Upload() {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [uploadResult, setUploadResult] = useState<UploadMetadata | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadingToBackend, setUploadingToBackend] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
  const [processingStage, setProcessingStage] = useState<string>('');
  const { toast } = useToast();
  const { refreshData } = useData();
  const navigate = useNavigate();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFile = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
    setUploading(true);
    setUploadingToBackend(true);
    setProcessingStage('Uploading file to server...');

    try {
      // Upload to backend
      const uploadResponse = await api.uploadCSV(selectedFile);
      
      setSessionId(uploadResponse.session_id);
      setProcessingStage(`Processing ${uploadResponse.total_cities} cities...`);
      
      toast({
        title: 'Upload Started',
        description: `Session ID: ${uploadResponse.session_id}`,
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Upload failed',
        variant: 'destructive',
      });
      setUploading(false);
      setUploadingToBackend(false);
    }
  };

  // Polling effect for upload status
  useEffect(() => {
    if (!sessionId || uploadStatus?.status === 'completed' || uploadStatus?.status === 'failed') {
      return;
    }
    
    const pollStatus = async () => {
      try {
        const status = await api.getUploadStatus(sessionId);
        setUploadStatus(status);
        
        setProcessingStage(
          `Processing: ${status.current_records} of ${status.total_cities} locations found...`
        );
        
        if (status.status === 'completed') {
          setProcessingStage('Fetching results from database...');
          
          // Fetch all spaces for this session
          const spaces = await api.getAllSpaces(sessionId);
          
          // Save to IndexedDB
          await saveSpaces(spaces as any, sessionId);
          const metadata: UploadMetadata = {
            id: sessionId,
            filename: file?.name || 'upload.csv',
            timestamp: new Date(),
            recordCount: spaces.length,
            processingTime: 0,
            status: 'success',
          };
          await saveUpload(metadata);
          
          // Update context
          await refreshData();
          
          setUploading(false);
          setUploadingToBackend(false);
          setUploadResult(metadata);
          
          toast({
            title: 'Upload Complete',
            description: `Successfully imported ${spaces.length} co-working spaces!`,
          });
          
          // Reset for next upload
          setTimeout(() => {
            setFile(null);
            setSessionId(null);
            setUploadStatus(null);
            setProcessingStage('');
          }, 3000);
        } else if (status.status === 'failed') {
          throw new Error('Processing failed');
        }
      } catch (error) {
        console.error('Status polling error:', error);
        toast({
          title: 'Processing Failed',
          description: 'Failed to check upload status',
          variant: 'destructive',
        });
        setUploading(false);
        setUploadingToBackend(false);
      }
    };
    
    // Poll every 3 seconds
    const interval = setInterval(pollStatus, 3000);
    
    // Initial poll
    pollStatus();
    
    return () => clearInterval(interval);
  }, [sessionId, uploadStatus?.status, file?.name, refreshData, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div>
      <PageHeader 
        title="Upload Data" 
        description="Import co-working space data from CSV files"
      />

      {!uploading && !uploadResult && (
        <Card 
          className={cn(
            "border-2 border-dashed transition-smooth",
            dragActive ? "border-primary bg-primary/5" : "border-border"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
              <UploadIcon className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Upload CSV File</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Drag and drop your CSV file here, or click to browse
            </p>
            <input
              type="file"
              id="file-upload"
              accept=".csv"
              onChange={handleChange}
              className="hidden"
            />
            <Button asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                Select CSV File
              </label>
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Supported format: CSV (.csv)
            </p>
          </CardContent>
        </Card>
      )}

      {uploading && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center space-y-3 flex-col">
              <div className="flex items-center space-x-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-lg font-medium">{processingStage || 'Processing...'}</p>
              </div>
            </div>
            
            {uploadStatus && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progress</span>
                  <span>{uploadStatus.current_records} / {uploadStatus.total_cities} locations</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(uploadStatus.current_records / uploadStatus.total_cities) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
              <span className="text-sm text-muted-foreground">
                Please wait while we process your data...
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {uploadResult && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Upload Complete!</h3>
                <p className="text-muted-foreground">
                  Successfully processed {uploadResult.recordCount.toLocaleString()} co-working spaces
                </p>
              </div>

              <div className="w-full max-w-md space-y-2 text-left">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">File name:</span>
                  <span className="text-sm font-medium">{uploadResult.filename}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Records processed:</span>
                  <span className="text-sm font-medium">{uploadResult.recordCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Processing time:</span>
                  <span className="text-sm font-medium">{(uploadResult.processingTime / 1000).toFixed(2)}s</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={() => navigate('/spaces')}>
                  View All Spaces
                </Button>
                <Button variant="outline" onClick={() => navigate('/')}>
                  Go to Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setUploadResult(null);
                    setProgress(0);
                    setStatus('');
                  }}
                >
                  Upload Another
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>CSV Format Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Required Columns:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><code className="px-1 py-0.5 bg-muted rounded text-xs">region</code> - Region name</li>
              <li><code className="px-1 py-0.5 bg-muted rounded text-xs">city</code> - City name</li>
              <li><code className="px-1 py-0.5 bg-muted rounded text-xs">state</code> - State name</li>
              <li><code className="px-1 py-0.5 bg-muted rounded text-xs">country</code> - Country name</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Optional Columns:</h4>
            <p className="text-sm text-muted-foreground">
              state, country, region, phone, website, rating, reviews, latitude, longitude, 
              accessibility_features, amenities, and more.
            </p>
          </div>

          <div className="flex items-start gap-2 p-3 bg-info/10 border border-info/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              <strong>Tip:</strong> Ensure your CSV file is properly formatted with headers in the first row. 
              Rows with missing required fields will be automatically filtered out.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
