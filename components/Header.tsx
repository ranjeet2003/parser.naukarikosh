"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface HeaderProps {
  setJsonResult: (json: string | null) => void;
  jsonResult: string | null;
}

export default function Header({ setJsonResult, jsonResult }: HeaderProps) {
  const [files, setFiles] = useState<string[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [generatingDetails, setGeneratingDetails] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleLoadFiles = async () => {
    setLoadingFiles(true);
    try {
      const response = await fetch("/api/list-json-details");
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      } else {
        toast.error("Failed to load files");
      }
    } catch (error) {
      toast.error("Error loading files:", {
        description: (error as Error).message,
      });
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleFileClick = async (fileName: string) => {
    setLoadingContent(true);
    try {
      const response = await fetch('/api/get-json-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName }),
      });

      if (response.ok) {
        const data = await response.json();
        setJsonResult(data.content);
        toast.success(`Loaded ${fileName}`);
        setIsDialogOpen(false);
      } else {
        toast.error("Failed to load file content");
        setJsonResult(null);
      }
    } catch (error) {
      toast.error("Error loading file content:", {
        description: (error as Error).message,
      });
      setJsonResult(null);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleGenerateDetails = async () => {
    if (!jsonResult) {
      toast.error("No JSON content to process.");
      return;
    }
    setGeneratingDetails(true);
    try {
      const response = await fetch('/api/generate-all-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jsonContent: jsonResult }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate details.');
      }

      const result = await response.json();
      toast.success("Started generating details!", {
        description: result.message,
      });
    } catch (err: any) {
      toast.error("Error generating details", {
        description: err.message,
      });
    } finally {
      setGeneratingDetails(false);
    }
  };

  return (
    <header className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-800 via-gray-900 to-black w-full shadow-md">
      <h1 className="text-xl font-bold text-white">Parser</h1>
      <div className="flex items-center gap-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleLoadFiles} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
              Load a JSON file
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select a JSON file</DialogTitle>
            </DialogHeader>
            {loadingFiles ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Loading files...</span>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {files.length > 0 ? (
                  files.map((file) => (
                    <li key={file}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleFileClick(file)}
                        disabled={loadingContent}
                      >
                        {loadingContent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {file}
                      </Button>
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground p-4 text-center">No files found.</p>
                )}
              </ul>
            )}
          </DialogContent>
        </Dialog>
        
        {jsonResult && (
          <Button onClick={handleGenerateDetails} disabled={generatingDetails} className="bg-blue-600 hover:bg-blue-700 text-white">
            {generatingDetails ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate All Details"
            )}
          </Button>
        )}
      </div>
    </header>
  );
}
