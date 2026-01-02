"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Globe } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import Link from "next/link";

const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
});

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [jsonResult, setJsonResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  const [saving, setSaving] = useState(false);
  const [savingCategories, setSavingCategories] = useState(false);

  const [files, setFiles] = useState<string[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleLoadFiles = async () => {
    setLoadingFiles(true);
    try {
      const response = await fetch("/api/list-json-details");
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files);
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

  const handleDeleteFile = async (fileName: string) => {
    setDeletingFile(fileName);
    try {
      const response = await fetch("/api/delete-json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename: fileName }),
      });

      if (response.ok) {
        toast.success("File deleted successfully");
        setFiles(files.filter((file) => file !== fileName));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete file.");
      }
    } catch (err: any) {
      toast.error("Error deleting file", {
        description: err.message,
      });
    } finally {
      setDeletingFile(null);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setJsonResult(null);
    setError(null);

    try {
      const response = await fetch("/api/parse-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: values.url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process URL.");
      }

      const data = await response.json();
      setJsonResult(JSON.stringify(data.data, null, 2));
      toast.success("URL processed successfully!");
    } catch (err: any) {
      setError(err.message);
      toast.error("Error processing URL", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }

  const handleSaveJson = async () => {
    if (jsonResult) {
      setSaving(true);
      try {
        const response = await fetch("/api/save-json", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ jsonData: JSON.parse(jsonResult) }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to save JSON file.");
        }

        const result = await response.json();
        toast.success("JSON file saved successfully!", {
          description: result.message,
        });
      } catch (err: any) {
        toast.error("Error saving JSON file", {
          description: err.message,
        });
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSaveAllCategories = async () => {
    if (jsonResult) {
      setSavingCategories(true);
      try {
        const response = await fetch("/api/save-all-categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ jsonData: JSON.parse(jsonResult) }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to save category-wise JSON files."
          );
        }

        const result = await response.json();
        toast.success("All categories saved successfully!", {
          description: result.message,
        });
      } catch (err: any) {
        toast.error("Error saving categories", {
          description: err.message,
        });
      } finally {
        setSavingCategories(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex flex-col items-center justify-center flex-grow p-4">
        <Toaster />
        <Card className="w-full max-w-2xl shadow-lg rounded-xl border-border animate-fade-in-up">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
              <Globe className="h-8 w-8" />
              URL to JSON Converter
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Enter a URL to fetch its HTML, convert it to JSON using Gemini AI,
              and save the result.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        Website URL
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com"
                          {...field}
                          className="bg-input border-border text-foreground focus:ring-primary focus:border-primary transition-all duration-300 ease-in-out"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-gradient-primary-accent text-primary-foreground hover:opacity-90 transition-opacity duration-300 ease-in-out flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {loading ? "Processing..." : "Convert to JSON"}
                </Button>
              </form>
            </Form>

            {error && (
              <div className="text-red-500 bg-red-900/20 border border-red-500 p-3 rounded-md text-sm animate-fade-in">
                Error: {error}
              </div>
            )}

            {jsonResult && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-xl font-semibold text-foreground">
                  Original JSON Output
                </h3>
                <Textarea
                  readOnly
                  value={jsonResult}
                  rows={10}
                  className="w-full bg-input border-border text-foreground font-mono resize-y min-h-[150px] focus:ring-primary focus:border-primary transition-all duration-300 ease-in-out"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={handleSaveJson}
                    className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white hover:opacity-90 transition-opacity duration-300 ease-in-out flex items-center justify-center gap-2"
                    disabled={saving}
                  >
                    {saving && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {saving ? "Saving..." : "Save JSON to project"}
                  </Button>
                  <Button
                    onClick={handleSaveAllCategories}
                    className="w-full bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white hover:opacity-90 transition-opacity duration-300 ease-in-out flex items-center justify-center gap-2"
                    disabled={savingCategories}
                  >
                    {savingCategories && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {savingCategories
                      ? "Saving Categories..."
                      : "Save All Categories"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="w-full max-w-2xl mt-8">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleLoadFiles} variant="outline" className="w-full">
                View Saved Files
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
                      <li key={file} className="flex items-center justify-between">
                        <span>{file}</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteFile(file)}
                          disabled={deletingFile === file}
                        >
                          {deletingFile === file ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            "Delete"
                          )}
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
        </div>

        <div className="w-full max-w-2xl mt-8">
          <div className="bg-muted text-muted-foreground text-center p-2 rounded-t-lg">
            parse category wise detailed page
          </div>
          <div className="grid grid-cols-6 bg-card border-x border-b rounded-b-lg">
            <Link href="/latest-job" className="p-4 text-center hover:bg-muted transition-colors">Latest Job</Link>
            <Link href="/admit-card" className="p-4 text-center hover:bg-muted transition-colors">Admit Card</Link>
            <Link href="/answer-keys" className="p-4 text-center hover:bg-muted transition-colors">Answer Keys</Link>
            <Link href="/results" className="p-4 text-center hover:bg-muted transition-colors">Results</Link>
            <Link href="/admission" className="p-4 text-center hover:bg-muted transition-colors">Admission</Link>
            <Link href="/other" className="p-4 text-center hover:bg-muted transition-colors">Other</Link>
          </div>
        </div>

        <p className="mt-8 text-muted-foreground text-sm">
          Powered by Next.js, Shadcn UI, and Gemini AI.
        </p>
      </main>
    </div>
  );
}
