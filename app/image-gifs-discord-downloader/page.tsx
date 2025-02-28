"use client";
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import hljs from 'highlight.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Copy, Loader2, Check, Download, RotateCcw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { z } from "zod";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"


// Define Zod schema for HTML validation
const htmlSchema = z.object({
    html: z.string()
        .min(1, "HTML input is required")
        .max(1000000, "HTML input is too large (max 1,000,000 characters)")
        .refine(
            (val) => {
                return val.includes("originalLink_af017a") ||
                    val.includes("cdn.discordapp.com/attachments") ||
                    val.includes("media.discordapp.net/attachments");
            },
            "No Discord image links detected. Make sure you've copied the correct HTML."
        )
});

interface RateLimitInfo {
    remaining: number;
    reset: number;
    total: number;
    downloadedCount?: number;
    totalImages?: number;
    remainingImages?: number;
    partialDownload?: boolean;
    awaitingDownload?: number;
    hasAwaitingDownloads?: boolean;
}

const MAX_IMAGES = 750; // Match the server-side constant

const DownloadImages = () => {
    const [html, setHtml] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationError, setValidationError] = useState('');
    const [hasCopied, setHasCopied] = useState(false);
    const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
    const [detectedImages, setDetectedImages] = useState<number>(0);
    const [animateRemaining, setAnimateRemaining] = useState(false);
    const [tick, setTick] = useState(false);
    const prevRemaining = useRef<number>();
    const lastDownloaded = useRef<number | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const deferredPromise = useRef<((value: boolean) => void) | null>(null);
    const [hasStartedDownloading, setHasStartedDownloading] = useState(false);
    const [downloadMode, setDownloadMode] = useState<'all' | 'remaining'>('all');
    const [showDownloadOptions, setShowDownloadOptions] = useState(false);
    const [isPartialDownloadDialogOpen, setIsPartialDownloadDialogOpen] = useState(false);
    const [partialDownloadInfo, setPartialDownloadInfo] = useState<{
        available: number;
        total: number;
    } | null>(null);
    const [isClearing, setIsClearing] = useState(false);
    const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

    const codeExample = `const imageLinks = document.querySelectorAll("a.originalLink_af017a");
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

    // Fetch rate limit on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await fetch('/api/downloadImages?action=check');
                if (response.ok) {
                    const data = await response.json();
                    setRateLimitInfo(data);

                    // Always show download options if there are awaiting images, regardless of rate limit
                    if (data.awaitingDownload && data.awaitingDownload > 0) {
                        setShowDownloadOptions(true);
                        // If we have awaiting images, consider that we've started downloading before
                        setHasStartedDownloading(true);

                        // Show a toast notification about awaiting images
                        toast.info("Images Awaiting Download", {
                            description: `You have ${data.awaitingDownload} images awaiting download.`,
                            duration: 5000,
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching rate limit:', error);
            }
        };

        fetchInitialData();
    }, []);

    // Function to fetch rate limit information
    const fetchRateLimit = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/downloadImages?action=check')
            if (response.ok) {
                const data = await response.json()
                setRateLimitInfo(data)

                // Always show download options if there are awaiting images, regardless of rate limit
                if (data.hasAwaitingDownloads || (data.awaitingDownload && data.awaitingDownload > 0)) {
                    setShowDownloadOptions(true)
                }
            }
        } catch (error) {
            console.error('Error fetching rate limit:', error)
        } finally {
            setIsLoading(false)
        }
    }

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
        // Start the timer if we have rate limit info, regardless of whether downloading has started
        if (!rateLimitInfo) return;

        // Don't start the timer if we're showing the default 20:00 (no actual rate limit data yet)
        // This happens when the user hasn't downloaded anything yet
        if (rateLimitInfo.reset === 0 || !hasStartedDownloading && rateLimitInfo.remaining === MAX_IMAGES && !rateLimitInfo.awaitingDownload && !rateLimitInfo.hasAwaitingDownloads) {
            return;
        }

        const now = Date.now();

        // If the reset time has passed, fetch fresh rate limit data
        if (now >= rateLimitInfo.reset) {
            const fetchRateLimit = async () => {
                try {
                    const response = await fetch('/api/downloadImages?action=check')
                    if (response.ok) {
                        const data = await response.json()
                        setRateLimitInfo(data)

                        // Always show download options if there are awaiting images
                        if ((data.awaitingDownload && data.awaitingDownload > 0) || data.hasAwaitingDownloads) {
                            setShowDownloadOptions(true);

                            // Show a toast notification that the rate limit has reset and awaiting images can be downloaded
                            if (data.remaining > 0) {
                                toast.success("Rate limit reset", {
                                    description: `You can now download your ${data.awaitingDownload} awaiting images.`,
                                    duration: 5000,
                                });
                            }
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch rate limit:', error)
                }
            }

            fetchRateLimit();
            return;
        }

        const interval = setInterval(() => {
            setTick(prev => !prev);

            // Check if we need to refresh the rate limit data
            const currentTime = Date.now();
            if (currentTime >= rateLimitInfo.reset) {
                clearInterval(interval);

                // Fetch fresh rate limit data
                const fetchRateLimit = async () => {
                    try {
                        const response = await fetch('/api/downloadImages?action=check')
                        if (response.ok) {
                            const data = await response.json()
                            setRateLimitInfo(data)

                            // Always show download options if there are awaiting images
                            if ((data.awaitingDownload && data.awaitingDownload > 0) || data.hasAwaitingDownloads) {
                                setShowDownloadOptions(true);

                                // Show a toast notification that the rate limit has reset and awaiting images can be downloaded
                                if (data.remaining > 0) {
                                    toast.success("Rate limit reset", {
                                        description: `You can now download your ${data.awaitingDownload} awaiting images.`,
                                        duration: 5000,
                                    });
                                }
                            }
                        }
                    } catch (error) {
                        console.error('Failed to fetch rate limit:', error)
                    }
                }

                fetchRateLimit();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [rateLimitInfo, tick, hasStartedDownloading]);

    // Effect to handle HTML input changes
    useEffect(() => {
        if (html.trim()) {
            const images = extractImagesFromHTML(html);
            setDetectedImages(images.length);
            setShowDownloadOptions(true); // Always show options if there's HTML input
        } else {
            setDetectedImages(0);
            // Only hide download options if there are no awaiting images
            if ((!rateLimitInfo?.awaitingDownload || rateLimitInfo.awaitingDownload === 0) && !rateLimitInfo?.hasAwaitingDownloads) {
                setShowDownloadOptions(false);
            }
            // Otherwise keep showing download options for awaiting images
        }
    }, [html, rateLimitInfo?.awaitingDownload, rateLimitInfo?.hasAwaitingDownloads]);

    // Add a periodic check for awaiting downloads
    useEffect(() => {
        // Only run this effect if the user has started downloading before
        if (!hasStartedDownloading) return;

        // Check for awaiting downloads every 10 seconds
        const checkInterval = setInterval(async () => {
            try {
                const response = await fetch('/api/downloadImages?action=check');
                if (response.ok) {
                    const data = await response.json();
                    setRateLimitInfo(data);

                    // Always show download options if there are awaiting images
                    if ((data.awaitingDownload && data.awaitingDownload > 0) || data.hasAwaitingDownloads) {
                        setShowDownloadOptions(true);
                    }
                }
            } catch (error) {
                console.error('Error checking for awaiting downloads:', error);
            }
        }, 10000); // Check every 10 seconds

        return () => clearInterval(checkInterval);
    }, [hasStartedDownloading]);

    const confirmWithUser = async () => {
        setIsDialogOpen(true);
        return new Promise<boolean>((resolve) => {
            deferredPromise.current = resolve;
        });
    };

    const confirmPartialDownload = async (available: number, total: number) => {
        setPartialDownloadInfo({ available, total });
        setIsPartialDownloadDialogOpen(true);
        return new Promise<'partial' | 'cancel'>((resolve) => {
            deferredPromise.current = (value) => {
                resolve(value ? 'partial' : 'cancel');
            };
        });
    };

    const validateHtml = (htmlContent: string): boolean => {
        try {
            htmlSchema.parse({ html: htmlContent });
            setValidationError('');
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorMessage = error.errors[0]?.message || "Invalid HTML input";
                setValidationError(errorMessage);
                toast.error("Validation Error", {
                    description: errorMessage,
                    duration: 4000,
                });
            }
            return false;
        }
    };

    const handleDownload = async (mode: 'all' | 'remaining') => {
        setDownloadMode(mode);

        // If there's no HTML input and we're trying to download all images, show an error
        if (mode === 'all' && !html.trim()) {
            toast.error('No HTML input provided', {
                description: 'Please paste Discord HTML to download images.',
                duration: 4000,
            });
            return;
        }

        // If we're downloading remaining images but there are none awaiting, show an error
        if (mode === 'remaining' && (!rateLimitInfo?.awaitingDownload || rateLimitInfo.awaitingDownload === 0)) {
            toast.error('No images awaiting download', {
                description: 'There are no images waiting to be downloaded.',
                duration: 4000,
            });
            return;
        }

        // Continue with the download process
        setHasStartedDownloading(true);

        try {
            // Validate HTML before proceeding (only for 'all' mode)
            if (mode === 'all' && !validateHtml(html)) {
                return;
            }

            // Check if we're at the rate limit and trying to download
            if (rateLimitInfo?.remaining === 0) {
                // Even if rate limited, still show the message about awaiting downloads
                if (rateLimitInfo.awaitingDownload && rateLimitInfo.awaitingDownload > 0) {
                    toast.info("Rate limit reached but images are saved", {
                        description: `You've reached your download limit. Your ${rateLimitInfo.awaitingDownload} images are saved and will be available when the rate limit resets in ${formatTimeRemaining(rateLimitInfo.reset)}.`,
                        duration: 5000,
                    });
                } else {
                    toast.error("Rate limit reached", {
                        description: `You've reached your download limit. Please wait ${formatTimeRemaining(rateLimitInfo.reset)} before downloading more images.`,
                        duration: 5000,
                    });
                }
                return;
            }

            // Modified confirmation check for downloading the same images again
            if (mode === 'all' && detectedImages === lastDownloaded.current) {
                const isConfirmed = await confirmWithUser();
                if (!isConfirmed) {
                    setIsLoading(false);
                    return;
                }
            }

            setIsLoading(true);
            setError('');

            const response = await fetch('/api/downloadImages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html, downloadMode: mode }),
            });

            // Handle rate limit exceeded but with available slots for partial download
            if (response.status === 429) {
                const data = await response.json();

                if (data.rateLimitInfo) {
                    setRateLimitInfo(data.rateLimitInfo);

                    // Always show download options when we have rate limit info
                    setShowDownloadOptions(true);

                    // If there are awaiting images, show a toast notification
                    if (data.awaitingDownload > 0) {
                        toast.info("Images Awaiting Download", {
                            description: `You have ${data.awaitingDownload} images awaiting download. You can download them when your rate limit resets.`,
                            duration: 5000,
                        });
                    }

                    // If there are available slots, offer partial download
                    const availableSlots = data.rateLimitInfo.remaining;
                    const totalImages = data.totalImages || detectedImages;

                    if (availableSlots > 0) {
                        const userChoice = await confirmPartialDownload(availableSlots, totalImages);

                        if (userChoice === 'partial') {
                            // User wants to download what's available
                            setIsLoading(false);
                            handleDownload('remaining');
                            return;
                        } else {
                            // User canceled
                            setIsLoading(false);
                            return;
                        }
                    }
                }

                throw new Error(data.error || 'Rate limit exceeded');
            }

            // Handle case where all images have already been downloaded
            if (response.status === 200 && !response.headers.get('Content-Type')?.includes('application/zip')) {
                const data = await response.json();
                if (data.message === 'All images have already been downloaded') {
                    toast.info("Already Downloaded", {
                        description: `All ${data.totalImages} images have already been downloaded.`,
                        duration: 4000,
                    });

                    if (data.downloadedCount) {
                        setRateLimitInfo(prev => prev ? {
                            ...prev,
                            downloadedCount: data.downloadedCount,
                            totalImages: data.totalImages
                        } : null);
                    }

                    setIsLoading(false);
                    return;
                }
            }

            // Handle all other error cases
            if (!response.ok) {
                const data = await response.json();
                if (data.rateLimitInfo) {
                    setRateLimitInfo(data.rateLimitInfo);
                }
                throw new Error(data.error || 'Failed to download images');
            }

            // Handle successful ZIP response
            const blob = await response.blob();

            // Get rate limit info from headers before creating blob
            const rateLimitInfoHeader = response.headers.get('X-RateLimit-Info');
            if (rateLimitInfoHeader) {
                const parsedInfo = JSON.parse(rateLimitInfoHeader);
                setRateLimitInfo(parsedInfo);

                // Always show download options if there are awaiting images
                if (parsedInfo.awaitingDownload > 0) {
                    setShowDownloadOptions(true);

                    // Show toast for partial downloads
                    if (parsedInfo.partialDownload) {
                        toast.success("Partial Download Complete", {
                            description: `Downloaded ${parsedInfo.downloadedCount} images. ${parsedInfo.awaitingDownload} images are awaiting download due to rate limits.`,
                            duration: 5000,
                        });
                    }
                } else if (mode === 'remaining') {
                    // Show success toast for awaiting images download
                    toast.success("Awaiting Images Downloaded", {
                        description: `Successfully downloaded ${parsedInfo.downloadedCount} awaiting images.`,
                        duration: 5000,
                    });

                    // Refresh rate limit info after download
                    fetchRateLimit();

                    // Hide download options if there are no more awaiting images
                    if (parsedInfo.awaitingDownload === 0 && !html.trim()) {
                        setShowDownloadOptions(false);
                    }
                }
            }

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
            lastDownloaded.current = detectedImages;

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to download images');
        } finally {
            setIsLoading(false);
            setIsDialogOpen(false);
            setIsPartialDownloadDialogOpen(false);
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

        // If we haven't started downloading or the reset time is 0, show the default time
        // But if there are awaiting images, we should still show the timer
        if ((!hasStartedDownloading && rateLimitInfo?.remaining === MAX_IMAGES &&
            !rateLimitInfo?.awaitingDownload && !rateLimitInfo?.hasAwaitingDownloads) || resetTime === 0) {
            return "60:00"; // Updated to match the 1 hour RATE_LIMIT_DURATION from backend
        }

        // If the reset time has passed, show "Ready" instead of "0:00"
        if (now >= resetTime) {
            return "Ready";
        }

        const diff = Math.max(0, resetTime - now);
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000)
            .toString()
            .padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const countImagesInHtml = (htmlContent: string) => {
        try {
            // Use DOM parsing to get unique image links
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');

            // Track unique URLs to prevent double-counting
            const uniqueUrls = new Set();

            // Look for Discord image links in various formats
            const originalLinks = doc.querySelectorAll('a.originalLink_af017a');
            originalLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.includes('cdn.discordapp.com/attachments')) uniqueUrls.add(href);
            });

            // Only add links that aren't already in the set
            const discordLinks = doc.querySelectorAll('a[href*="cdn.discordapp.com/attachments"]');
            discordLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href) uniqueUrls.add(href);
            });

            console.log('Found unique images via DOM parser:', uniqueUrls.size);
            return uniqueUrls.size;
        } catch (error) {
            console.error('Error counting images:', error);

            // Fallback to regex with unique URL extraction
            try {
                const urlRegex = /href="(https:\/\/cdn\.discordapp\.com\/attachments\/[^"]+)"/g;
                const matches = [];
                let match;

                // Extract all URLs
                while ((match = urlRegex.exec(htmlContent)) !== null) {
                    matches.push(match[1]); // Push the captured URL
                }

                // Use a Set to get unique URLs
                const uniqueUrls = new Set(matches);
                console.log('Found unique images via regex:', uniqueUrls.size);
                return uniqueUrls.size;
            } catch (regexError) {
                console.error('Error in regex fallback:', regexError);
                return 0;
            }
        }
    };

    const handleClearDownloadHistory = async () => {
        try {
            setIsClearing(true);
            const response = await fetch('/api/downloadImages?action=reset', {
                method: 'POST',
            });

            if (response.ok) {
                const data = await response.json();
                toast.success('Images awaiting download have been cleared successfully.');

                // Update rate limit info directly from the response
                setRateLimitInfo({
                    remaining: data.remaining,
                    reset: data.reset,
                    total: data.total,
                    downloadedCount: data.downloadedCount,
                    awaitingDownload: data.awaitingDownload,
                    hasAwaitingDownloads: data.hasAwaitingDownloads
                });

                // Hide download options if there are no awaiting images and no HTML input
                if (!data.hasAwaitingDownloads && !html.trim()) {
                    setShowDownloadOptions(false);
                }
            } else {
                const errorData = await response.json();
                toast.error(`Failed to clear images awaiting download: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error clearing images awaiting download:', error);
            toast.error('An error occurred while clearing images awaiting download.');
        } finally {
            setIsClearing(false);
            setIsClearDialogOpen(false);
        }
    };

    // Function to extract image URLs from HTML
    const extractImagesFromHTML = (html: string) => {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Track unique URLs to prevent double-counting
            const uniqueUrls = new Set();

            // Look for Discord image links in various formats
            const originalLinks = doc.querySelectorAll('a.originalLink_af017a');
            originalLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('https://') && href.includes('cdn.discordapp.com/attachments')) {
                    uniqueUrls.add(href);
                }
            });

            // Only add links that aren't already in the set
            const discordLinks = doc.querySelectorAll('a[href*="cdn.discordapp.com/attachments"]');
            discordLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('https://')) {
                    uniqueUrls.add(href);
                }
            });

            return Array.from(uniqueUrls);
        } catch (error) {
            console.error('Error extracting images:', error);

            // Fallback to regex with unique URL extraction
            try {
                const urlRegex = /href="(https:\/\/cdn\.discordapp\.com\/attachments\/[^"]+)"/g;
                const matches = [];
                let match;

                // Extract all URLs
                while ((match = urlRegex.exec(html)) !== null) {
                    matches.push(match[1]); // Push the captured URL
                }

                // Use a Set to get unique URLs
                return Array.from(new Set(matches));
            } catch (regexError) {
                console.error('Error in regex fallback:', regexError);
                return [];
            }
        }
    };

    return (
        <div className="w-full min-h-screen overflow-auto pb-12" style={{ height: '100vh' }}>
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Download</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to download the same {detectedImages} images again?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            deferredPromise.current?.(false);
                            setIsDialogOpen(false);
                        }}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            deferredPromise.current?.(true);
                            setIsDialogOpen(false);

                        }}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isPartialDownloadDialogOpen} onOpenChange={setIsPartialDownloadDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Rate Limit Reached</AlertDialogTitle>
                        <AlertDialogDescription>
                            You can only download {partialDownloadInfo?.available} more images in this time period.
                            Would you like to download these {partialDownloadInfo?.available} images now?
                            The remaining {partialDownloadInfo ? partialDownloadInfo.total - partialDownloadInfo.available : 0} images
                            will be saved for later download when your rate limit resets.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            deferredPromise.current?.(false);
                            setIsPartialDownloadDialogOpen(false);
                        }}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            deferredPromise.current?.(true);
                            setIsPartialDownloadDialogOpen(false);
                        }}>
                            Download Available Images
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Clear Images Awaiting Download ({rateLimitInfo?.awaitingDownload})</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will clear your images awaiting download, allowing you to re-download previously downloaded images.
                            Your rate limit count will remain unchanged.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsClearDialogOpen(false)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearDownloadHistory}>
                            Clear Images Awaiting Download
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="container mx-auto px-4 py-6 max-w-6xl">
                <Card className="bg-secondary/20 group transition-all duration-300 hover:shadow-md border border-primary/20 rounded-lg py-6 my-6">
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
                                    2. Go to the channel where you want to download the images/gifs
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    3. Press F12 (or right-click and select &quot;Inspect&quot;)
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    4. Click on the &quot;Console&quot; tab
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    5. Paste the copied code and press Enter
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
                                        const newValue = e.target.value;
                                        if (newValue.length > 1500000) {
                                            toast.error("Input too large", {
                                                description: "Maximum 1,500,000 characters",
                                                duration: 4444,
                                            })
                                            return;
                                        }
                                        setHtml(newValue);

                                        // Count detected images
                                        const imageCount = countImagesInHtml(newValue);
                                        setDetectedImages(imageCount);

                                        // Show download options if there are images or awaiting downloads
                                        if (imageCount > 0 || (rateLimitInfo?.awaitingDownload && rateLimitInfo.awaitingDownload > 0)) {
                                            setShowDownloadOptions(true);
                                        } else if (!newValue.trim() && (!rateLimitInfo?.awaitingDownload || rateLimitInfo.awaitingDownload === 0)) {
                                            setShowDownloadOptions(false);
                                        }

                                        // Clear validation error when user types
                                        if (validationError) setValidationError('');
                                    }}
                                    placeholder="Paste your HTML here..."
                                    className={`min-h-[200px] font-mono text-sm transition-all duration-300 
                                    hover:shadow-md focus:shadow-md ${html.length > 1000000 ? 'border-destructive/40' : ''}`}
                                />
                                {validationError && (
                                    <Alert variant="destructive" className="mt-2 animate-in slide-in-from-top duration-300">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{validationError}</AlertDescription>
                                    </Alert>
                                )}
                                {html.trim() && !validationError && (
                                    <p className="text-sm text-muted-foreground">
                                        {detectedImages} image{detectedImages !== 1 ? 's' : ''} detected
                                    </p>
                                )}
                                {html.length > 1000000 && (
                                    <p className="text-sm text-muted-foreground bg-destructive/20 p-4 rounded-md border border-destructive/40 max-w-sm">
                                        Maximum 1,000,000 characters reached, please reduce the amount of images you want to download
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

                            {showDownloadOptions && rateLimitInfo ? (
                                <div className="space-y-3">
                                    <Alert className={`${rateLimitInfo.remaining === 0 ? "bg-destructive/10 border-destructive/20" : "bg-primary/10 border-primary/20"} max-w-sm`}>
                                        <AlertDescription>
                                            {rateLimitInfo.remaining === 0 ? (
                                                <>
                                                    You&lsquo;ve reached your download limit. Please wait until {formatTimeRemaining(rateLimitInfo.reset)} before downloading more images.
                                                    {rateLimitInfo.awaitingDownload && rateLimitInfo.awaitingDownload > 0 && (
                                                        <> You have {rateLimitInfo.awaitingDownload} images awaiting download.</>
                                                    )}
                                                </>
                                            ) : rateLimitInfo.awaitingDownload && rateLimitInfo.awaitingDownload > 0 ? (
                                                <>
                                                    You have {rateLimitInfo.awaitingDownload} images awaiting download from your previous session.
                                                </>
                                            ) : rateLimitInfo.downloadedCount && rateLimitInfo.totalImages ? (
                                                <>
                                                    You have downloaded {rateLimitInfo.downloadedCount} of {rateLimitInfo.totalImages} images.
                                                    <br />{rateLimitInfo.remainingImages} images remaining to download.
                                                </>
                                            ) : (
                                                <>
                                                    You can download up to {rateLimitInfo.remaining} images in this session.
                                                </>
                                            )}
                                        </AlertDescription>
                                    </Alert>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {/* Download Remaining/Awaiting Button - Always show if there are awaiting downloads */}
                                        {((rateLimitInfo.awaitingDownload && rateLimitInfo.awaitingDownload > 0) || rateLimitInfo.hasAwaitingDownloads) && (
                                            <Button
                                                onClick={() => handleDownload('remaining')}
                                                disabled={isLoading}
                                                className="transition-all duration-300 hover:shadow-md"
                                                size="lg"
                                            >
                                                {isLoading && downloadMode === 'remaining' ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Downloading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Download Awaiting Images ({rateLimitInfo.awaitingDownload})
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                        {/* Download All Button */}
                                        {html.trim() && (
                                            <Button
                                                onClick={() => handleDownload('all')}
                                                disabled={isLoading || !html.trim() || rateLimitInfo.remaining === 0}
                                                className="transition-all duration-300 hover:shadow-md"
                                                size="lg"
                                            >
                                                {isLoading && downloadMode === 'all' ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Downloading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Download All Images ({detectedImages})
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    onClick={() => handleDownload('all')}
                                    disabled={isLoading || !html.trim() || Boolean(rateLimitInfo?.remaining === 0)}
                                    className="w-full transition-all duration-300 hover:shadow-md"
                                    size="lg"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Downloading...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download Images as ZIP ({detectedImages})
                                        </>
                                    )}
                                </Button>
                            )}

                            {error && (
                                <Alert variant="destructive" className="animate-in slide-in-from-top duration-300">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                        </div>

                        {rateLimitInfo ? (
                            <Card className="mt-4 max-w-md">
                                <CardHeader className="pb-2 pt-3 px-4">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">
                                            Rate Limit Status
                                        </CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsClearDialogOpen(true)}
                                            disabled={isClearing}
                                            className="h-8 text-xs"
                                        >
                                            {isClearing ? (
                                                <>
                                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                                    Clearing...
                                                </>
                                            ) : (
                                                'Clear Images Awaiting Download'
                                            )}
                                        </Button>
                                    </div>
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



                                    {rateLimitInfo.awaitingDownload !== undefined && rateLimitInfo.awaitingDownload > 0 && (
                                        <div className="pt-2 border-t border-border mt-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Awaiting Download:</span>
                                                <span className="font-mono text-foreground">
                                                    {rateLimitInfo.awaitingDownload}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="mt-4 animate-pulse">
                                <CardHeader className="pb-2 pt-3 px-4">
                                    <div className="flex justify-between items-center">
                                        <Skeleton className="h-5 w-[120px]" />
                                        <Skeleton className="h-8 w-[100px]" />
                                    </div>
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
        </div>
    );
};

export default DownloadImages; 