"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import hljs from 'highlight.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Copy, Loader2, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const DownloadImages = () => {
    const { toast } = useToast();
    const [html, setHtml] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasCopied, setHasCopied] = useState(false);

    const codeExample = `const imageLinks = document.querySelectorAll("a.originalLink_af017a");
console.log("Loading image elements...");

let imageElements = "";
imageLinks.forEach((link) => {
  imageElements += link.outerHTML + "\\n";
});

const textarea = document.createElement("textarea");
textarea.value = imageElements;
document.body.appendChild(textarea);
textarea.select();
document.execCommand("copy");
document.body.removeChild(textarea);
console.log(
  \`✅ Success: \${imageLinks.length} image elements copied to clipboard! Now Paste the HTML into the text area on the website\`
);`;

    // Use a single useEffect for highlighting
    useEffect(() => {
        // Configure highlight.js if needed (optional)
        hljs.configure({
            ignoreUnescapedHTML: true,
            languages: ['javascript'] // Only load languages you need
        });

        // Register any custom languages if needed
        // hljs.registerLanguage('customLang', customLanguageDefinition);

        // Highlight the code block
        const codeBlock = document.querySelector('code');
        if (codeBlock) {
            hljs.highlightElement(codeBlock);
        }

        // Cleanup function
        return () => {
            // If you need any cleanup
            // hljs.unregisterLanguage('customLang');
        };
    }, [codeExample]); // Re-run when code example changes

    const handleDownload = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch('/api/downloadImages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ html }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to download images');
            }

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'images.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to download images');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(codeExample);
            setHasCopied(true);
            toast({
                title: "Copied!",
                description: "Code copied to clipboard",
                duration: 4444,
            });

            // Use setTimeout to reset the state
            setTimeout(() => {
                setHasCopied(false);
            }, 4444);
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to copy code",
                variant: "destructive",
                duration: 4444,
            });
        }
    };

    return (
        <div className="sm:container px-1.5 mx-auto py-8 max-w-6xl space-y-8">
            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Download Images/Gifs from Discord</CardTitle>
                    <VisuallyHidden>
                        <CardDescription className="text-base">
                            Follow these steps to download images/gifs from a discord channel
                        </CardDescription>
                    </VisuallyHidden>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Step 1: Copy Code */}
                    <div className="space-y-4 transition-all duration-300 hover:translate-x-0.5">
                        <div className="flex items-center space-x-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium transition-colors duration-300 hover:bg-primary hover:text-primary-foreground">
                                1
                            </div>
                            <h3 className="text-lg font-semibold">Copy the Code</h3>
                        </div>
                        <Card className="bg-muted group transition-all duration-300 hover:shadow-md ">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 !py-1 !px-2">
                                <CardTitle className="text-sm font-medium">Browser Console Code</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`border border-primary h-8 w-10 p-0 transition-all duration-300 
                                        ${hasCopied ? 'text-green-500 scale-105' : 'hover:scale-110 hover:text-primary'}`}
                                    onClick={handleCopy}
                                >
                                    {hasCopied ? (
                                        <Check className="h-5 w-5 animate-in zoom-in duration-300" />
                                    ) : (
                                        <Copy className="h-5 w-5" />
                                    )}
                                    <span className="sr-only">Copy code</span>
                                </Button>
                            </CardHeader>
                            <CardContent className="!p-1.5">
                                <pre className="overflow-x-auto p-2 rounded-lg bg-[#282c34] transition-all duration-300 group-hover:bg-[#2d323b]">
                                    <code className="hljs text-sm" data-language="javascript">
                                        {codeExample}
                                    </code>
                                </pre>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Step 2: Open Discord Console */}
                    <div className="space-y-4 transition-all duration-300 hover:translate-x-0.5">
                        <div className="flex items-center space-x-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium transition-colors duration-300 hover:bg-primary hover:text-primary-foreground">
                                2
                            </div>
                            <h3 className="text-lg font-semibold">Open Discord Console</h3>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                1. Go to Discord in your web browser
                            </p>
                            <p className="text-sm text-muted-foreground">
                                2. Press F12 (or right-click and select &quot;Inspect&quot;)
                            </p>
                            <p className="text-sm text-muted-foreground">
                                3. Click on the &quot;Console&quot; tab
                            </p>
                            <p className="text-sm text-muted-foreground">
                                4. Paste the copied code and press Enter
                            </p>
                        </div>
                    </div>

                    {/* Step 3: Paste HTML */}
                    <div className="space-y-4 transition-all duration-300 hover:translate-x-0.5">
                        <div className="flex items-center space-x-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium transition-colors duration-300 hover:bg-primary hover:text-primary-foreground">
                                3
                            </div>
                            <h3 className="text-lg font-semibold">Paste the HTML</h3>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="html-input" className="text-sm text-muted-foreground">
                                After running the code, paste the copied HTML here
                            </Label>
                            <Textarea
                                id="html-input"
                                value={html}
                                onChange={(e) => setHtml(e.target.value)}
                                placeholder="Paste your HTML here..."
                                className="min-h-[200px] font-mono text-sm transition-all duration-300 
                                    hover:shadow-md focus:shadow-md focus:translate-y-[-2px]"
                            />
                        </div>
                    </div>

                    {/* Step 4: Download */}
                    <div className="space-y-4 transition-all duration-300 hover:translate-x-0.5">
                        <div className="flex items-center space-x-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium transition-colors duration-300 hover:bg-primary hover:text-primary-foreground">
                                4
                            </div>
                            <h3 className="text-lg font-semibold">Download Images</h3>
                        </div>
                        <Button
                            onClick={handleDownload}
                            disabled={loading || !html.trim()}
                            className="w-full transition-all duration-300 hover:shadow-md 
                                hover:translate-y-[-2px] disabled:hover:translate-y-0"
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Downloading...
                                </>
                            ) : (
                                'Download Images as ZIP'
                            )}
                        </Button>

                        {error && (
                            <Alert variant="destructive" className="animate-in slide-in-from-top duration-300">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DownloadImages; 