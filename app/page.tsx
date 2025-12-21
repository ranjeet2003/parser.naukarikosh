"use client";

import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Globe } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import Header from "@/components/Header";

interface LinkItem {
  title: string;
  link: string;
}

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

  // New states for link processing
  const [parsedJsonData, setParsedJsonData] = useState<any | null>(null);
  const [extractedLinks, setExtractedLinks] = useState<LinkItem[]>([]);
  const [convertingLink, setConvertingLink] = useState<string | null>(null);
  const [convertedHtmlToJsonResult, setConvertedHtmlToJsonResult] = useState<string | null>(null);
  const [showConvertedJsonDialog, setShowConvertedJsonDialog] = useState(false);

  useEffect(() => {
    if (jsonResult) {
      try {
        const parsed = JSON.parse(jsonResult);
        setParsedJsonData(parsed);
        setExtractedLinks(extractLinksFromJson(parsed));
      } catch (e) {
        console.error("Failed to parse jsonResult:", e);
        setParsedJsonData(null);
        setExtractedLinks([]);
        toast.error("Failed to parse loaded JSON content.");
      }
    } else {
      setParsedJsonData(null);
      setExtractedLinks([]);
    }
  }, [jsonResult]);

  const extractLinksFromJson = (data: any): LinkItem[] => {
    const links: LinkItem[] = [];
    const visited = new Set();

    const traverse = (obj: any) => {
      if (!obj || typeof obj !== 'object' || visited.has(obj)) {
        return;
      }
      visited.add(obj);

      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];

          if (typeof value === 'object' && value !== null) {
            // Check if it's an object with 'link' and 'title'/'text' properties
            if (
              (typeof value.link === 'string' && value.link.startsWith('http')) &&
              (typeof value.title === 'string' || typeof value.text === 'string')
            ) {
              links.push({
                title: value.title || value.text,
                link: value.link,
              });
            }
             // Check if it's an object with 'url' and 'title'/'text' properties
            else if (
              (typeof value.url === 'string' && value.url.startsWith('http')) &&
              (typeof value.title === 'string' || typeof value.text === 'string')
            ) {
              links.push({
                title: value.title || value.text,
                link: value.url,
              });
            }
            // If it's an array, iterate through its elements
            else if (Array.isArray(value)) {
              value.forEach(item => traverse(item));
            }
            // If it's a plain object, recurse
            else {
              traverse(value);
            }
          }
        }
      }
    };
    
    traverse(data);
    return links;
  };

  const handleConvertLinkHtmlToJson = async (linkUrl: string) => {
    setConvertingLink(linkUrl);
    setConvertedHtmlToJsonResult(null);
    try {
      const response = await fetch('/api/html-to-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: linkUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to convert HTML to JSON.");
      }

      const data = await response.json();
      setConvertedHtmlToJsonResult(JSON.stringify(data.data, null, 2));
      setShowConvertedJsonDialog(true);
      toast.success("HTML converted to JSON successfully!");
    } catch (err: any) {
      toast.error("Error converting HTML to JSON", {
        description: err.message,
      });
    } finally {
      setConvertingLink(null);
    }
  }


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setJsonResult(null);
    setError(null);
    setConvertedHtmlToJsonResult(null); // Clear previous AI conversion result

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
      <Header setJsonResult={setJsonResult} jsonResult={jsonResult} />
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
              and save the result. Or load a JSON file to process links within it.
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
                  rows={10} // Reduced rows to make space for links
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

            {extractedLinks.length > 0 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-xl font-semibold text-foreground">
                  Extracted Links
                </h3>
                <ul className="space-y-3">
                  {extractedLinks.map((item, index) => (
                    <li
                      key={index}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-md bg-card shadow-sm"
                    >
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline flex-grow mr-4 break-all"
                      >
                        {item.title || item.link}
                      </a>
                      <Button
                        onClick={() => handleConvertLinkHtmlToJson(item.link)}
                        disabled={convertingLink === item.link}
                        className="mt-2 sm:mt-0 bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1 flex items-center gap-2"
                      >
                        {convertingLink === item.link && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {convertingLink === item.link
                          ? "Converting..."
                          : "Convert HTML to JSON"}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
        <p className="mt-8 text-muted-foreground text-sm">
          Powered by Next.js, Shadcn UI, and Gemini AI.
        </p>
      </main>

      {/* Dialog for displaying converted HTML to JSON result */}
      <Dialog open={showConvertedJsonDialog} onOpenChange={setShowConvertedJsonDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Converted HTML to JSON</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-auto">
            {convertedHtmlToJsonResult ? (
              <Textarea
                readOnly
                value={convertedHtmlToJsonResult}
                rows={20}
                className="w-full bg-input border-border text-foreground font-mono resize-y min-h-[300px]"
              />
            ) : (
              <p>No JSON data available.</p>
            )}
          </div>
          <Button onClick={() => setShowConvertedJsonDialog(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
