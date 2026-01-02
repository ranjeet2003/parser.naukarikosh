"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
});

interface CategoryTabFormProps {
  category: string;
}

export default function CategoryTabForm({ category }: CategoryTabFormProps) {
  const [loading, setLoading] = useState(false);
  const [showConvertedJsonDialog, setShowConvertedJsonDialog] = useState(false);
  const [convertedHtmlToJsonResult, setConvertedHtmlToJsonResult] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
        const response = await fetch('/api/html-to-json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: values.url }),
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
        setLoading(false);
      }
  }

  return (
    <div>
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
