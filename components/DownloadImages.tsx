"use client";
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import hljs from 'highlight.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Copy, Loader2, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
interface RateLimitInfo {
    remaining: number;
    reset: number;
    total: number;
}

const DownloadImages = () => {
    const [html, setHtml] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasCopied, setHasCopied] = useState(false);
    const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
    const [detectedImages, setDetectedImages] = useState<number>(0);
    const [animateRemaining, setAnimateRemaining] = useState(false);
    const [tick, setTick] = useState(false);
    const prevRemaining = useRef<number>();
    const lastDownloaded = useRef<number | null>(null);

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

    useEffect(() => {
        const fetchRateLimit = async () => {
            try {
                const response = await fetch('/api/downloadImages')
                if (response.ok) {
                    const data = await response.json()
                    setRateLimitInfo(data)
                }
            } catch (error) {
                console.error('Failed to fetch rate limit:', error)
            }
        }

        fetchRateLimit()
    }, [])

    useEffect(() => {
        if (rateLimitInfo && prevRemaining.current !== undefined) {
            if (rateLimitInfo.remaining !== prevRemaining.current) {
                setAnimateRemaining(true);
                const timer = setTimeout(() => setAnimateRemaining(false), 400);
                return () => clearTimeout(timer);
            }
        }
        prevRemaining.current = rateLimitInfo?.remaining;
    }, [rateLimitInfo]);

    useEffect(() => {
        if (!rateLimitInfo) return;

        const now = Date.now();
        if (now >= rateLimitInfo.reset) return;

        const interval = setInterval(() => {
            setTick(prev => !prev);
        }, 1000);

        return () => clearInterval(interval);
    }, [rateLimitInfo, tick]);

    const handleDownload = async () => {
        try {
            // Add confirmation for same number of images
            if (detectedImages === lastDownloaded.current) {
                const isConfirmed = confirm(
                    `Are you sure you want to download the same ${detectedImages} images again?`
                );
                if (!isConfirmed) return;
            }

            setLoading(true);
            setError('');

            const response = await fetch('/api/downloadImages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html }),
            });

            const contentType = response.headers.get('content-type') || '';

            if (contentType.includes('application/json')) {
                const data = await response.json();
                if (data.rateLimitInfo) {
                    setRateLimitInfo(data.rateLimitInfo);
                }
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to download images');
                }
            }

            // Stream the response directly
            const reader = response.body?.getReader();
            if (!reader) throw new Error('Failed to read response stream');

            const stream = new ReadableStream({
                async start(controller) {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        controller.enqueue(value);
                    }
                    controller.close();
                    reader.releaseLock();
                }
            });

            const newStream = new Response(stream);
            const blob = await newStream.blob();

            // Create temporary URL with proper cleanup
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'images.zip';
            document.body.appendChild(a);
            a.click();

            // Cleanup
            URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Get rate limit info from headers for successful downloads
            const rateLimitInfoHeader = response.headers.get('X-RateLimit-Info');
            if (rateLimitInfoHeader) {
                setRateLimitInfo(JSON.parse(rateLimitInfoHeader));
            }

            // After successful download
            lastDownloaded.current = detectedImages;

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
            toast.success("Copied!", {
                description: "Code copied to clipboard",
                duration: 4444,
            });

            // Use setTimeout to reset the state
            setTimeout(() => {
                setHasCopied(false);
            }, 4444);
        } catch (err) {
            toast.error("Failed to copy code", {
                description: "Please try again",
                duration: 4444,
            })
        }
    };

    const formatTimeRemaining = (resetTime: number) => {
        const now = Date.now();
        const diff = Math.max(0, resetTime - now);
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000)
            .toString()
            .padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const countImagesInHtml = (htmlContent: string) => {
        try {
            // First try to count direct matches using regex
            const matches = htmlContent.match(/class="originalLink_af017a"/g);
            if (matches) {
                console.log('Found images via regex:', matches.length);
                return matches.length;
            }

            // Fallback to DOM parsing if regex fails
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            const count = doc.querySelectorAll('a.originalLink_af017a').length;
            console.log('Found images via DOM parser:', count);
            return count;
        } catch (error) {
            console.error('Error counting images:', error);
            // Last resort: simple string match
            const simpleCount = (htmlContent.match(/originalLink_af017a/g) || []).length;
            console.log('Found images via simple match:', simpleCount);
            return simpleCount;
        }
    };

    return (
        <div className="sm:container px-1.5 mx-auto py-8 max-w-6xl space-y-8">
            <Card className="bg-secondary/20 group transition-all duration-300 hover:shadow-md border border-primary/20 rounded-lg pt-2">
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
                    <div className="space-y-4 transition-all duration-300">
                        <div className="flex items-center space-x-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium transition-colors duration-300 hover:bg-primary hover:text-primary-foreground">
                                1
                            </div>
                            <h3 className="text-lg font-semibold">Copy the Code</h3>
                            <Button
                                variant="outline"
                                size="sm"
                                className={`ml-auto !dark:text-green-400/60 !text-green-600 h-auto p-2 gap-2 transition-colors border-green-600/50 dark:border-green-400/50 
                                            hover:bg-secondary hover:text-green-600
                                            ${hasCopied ? 'text-green-600' : 'text-muted-foreground'}`}
                                onClick={handleCopy}
                            >
                                {hasCopied ? (
                                    <Check className="h-4 w-4 flex-shrink-0 animate-in zoom-in duration-300 scale-110" />
                                ) : (
                                    <Copy className="h-4 w-4 flex-shrink-0 transition-transform hover:scale-110" />
                                )}
                                <span className="sr-only">Copy code</span>
                            </Button>
                        </div>
                        <Card className="bg-muted group transition-all duration-300 hover:shadow-md border border-primary/20 rounded-lg pt-2">
                            <VisuallyHidden> <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-medium">Browser Console Code</CardTitle>
                            </CardHeader>
                            </VisuallyHidden>
                            <CardContent className=" w-full">

                                <pre className="overflow-x-auto w-full ">
                                    <code className="hljs text-xs sm:text-sm w-full  " data-language="javascript">
                                        {codeExample}
                                    </code>
                                </pre>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Step 2: Open Discord Console */}
                    <div className="space-y-4 transition-all duration-300">
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
                    <div className="space-y-4 transition-all duration-300">
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
                                onChange={(e) => {
                                    if (e.target.value.length > 1500000) {
                                        toast.error("Input too large", {
                                            description: "Maximum 1,500,000 characters",
                                            duration: 4444,
                                        })
                                        return;
                                    }
                                    setHtml(e.target.value);
                                    setDetectedImages(countImagesInHtml(e.target.value));
                                }}
                                placeholder="Paste your HTML here..."
                                className="min-h-[200px] font-mono text-sm transition-all duration-300 
                                    hover:shadow-md focus:shadow-md "
                            />
                            {html.trim() && (
                                <p className="text-sm text-muted-foreground">
                                    {detectedImages} image{detectedImages !== 1 ? 's' : ''} detected
                                </p>
                            )}
                            {html.length > 1500000 ? (
                                <p className="text-sm text-muted-foreground">
                                    Maximum 1,500,000 characters
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    {html.length}/1,500,000 characters
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Step 4: Download */}
                    <div className="space-y-4 transition-all duration-300">
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
                               "
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

                    {rateLimitInfo ? (
                        <Card className="mt-4">
                            <CardHeader className="pb-2 pt-3 px-4">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Rate Limit Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-3 space-y-4">
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-muted-foreground">Remaining:</span>
                                            <span
                                                className={`font-mono ${animateRemaining ? 'text-primary' : 'text-foreground'} transition-opacity duration-300`}
                                                key={rateLimitInfo.remaining}
                                            >
                                                {rateLimitInfo.remaining}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-muted-foreground">Total:</span>
                                            <span className="font-mono text-foreground">
                                                {rateLimitInfo.total}
                                            </span>
                                        </div>
                                    </div>
                                    <Progress
                                        value={(rateLimitInfo.remaining / rateLimitInfo.total) * 100}
                                        className="h-2 mt-4"
                                    />
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Reset in:</span>
                                    <span className="font-mono text-foreground">
                                        {formatTimeRemaining(rateLimitInfo.reset)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="mt-4 animate-pulse">
                            <CardHeader className="pb-2 pt-3 px-4">
                                <Skeleton className="h-5 w-[120px]" />
                            </CardHeader>
                            <CardContent className="px-4 pb-3 space-y-4">
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center space-x-2">
                                            <Skeleton className="h-5 w-16" />
                                            <Skeleton className="h-5 w-8" />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Skeleton className="h-5 w-16" />
                                            <Skeleton className="h-5 w-8" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-2 w-full mt-4" />
                                </div>
                                <div className="flex justify-between text-sm">
                                    <Skeleton className="h-5 w-16" />
                                    <Skeleton className="h-5 w-20" />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default DownloadImages; 