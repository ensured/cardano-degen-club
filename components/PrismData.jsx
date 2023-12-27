"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import Prism from "prismjs"
import { toast } from "sonner"

import { cn } from "@/lib/utils"

import { Button, buttonVariants } from "./ui/button"

const PrismData = () => {
  useEffect(() => {
    Prism.highlightAll()
  }, [])

  const codeRef = useRef(null)

  const handleCopy = () => {
    const code = codeRef.current.textContent
    console.log(code)
    navigator.clipboard.writeText(code).then(
      () => {
        toast.success("Copied to clipboard!", {
          position: "top-right",
          duration: 2000,
          style: "",
        })
      },
      (err) => {
        console.error("Failed to copy:", err)
      }
    )
  }

  const code = `const handleMutations = (mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === "childList") {
                const overlapManager = document.querySelector(
                    "#overlap-manager-root > div:nth-child(2)"
                );
                const goPro = document.querySelector(
                    "#overlap-manager-root > div:nth-child(2) > div"
                );
                const span = document.querySelector(
                    "#overlap-manager-root > div:nth-child(4) > div"
                );

                if (overlapManager) {
                    if (goPro) {
                        console.log("Ads found!");
                        goPro.remove();
                        console.log("Ads removed :)");
                    }
                    if (span) {
                        console.log("Ads found!");
                        span.remove();
                        console.log("Ads removed :)");
                    }
                }
            }
        }
    };

    const observerConfig = {
        childList: true,
        subtree: true
    };

    const observer = new MutationObserver(handleMutations);

    observer.observe(document.body, observerConfig);
    `
  return (
    <div className="ml-2">
      <pre className="rounded-md">
        <div className={cn("relative flex justify-end ")}>
          <Button
            variant={"green"}
            className="absolute font-bold text-2xl"
            onClick={handleCopy}
          >
            <Image src="/copy.png" width={28} height={28} alt="Copy icon" />
            Copy
          </Button>
        </div>
        <code className="language-javascript" ref={codeRef}>
          {code}
        </code>
      </pre>
      <Link
        className="flex justify-center bg-red-500 p-4"
        href="https://www.flaticon.com/free-icons/ui"
        title="ui icons"
      >
        Ui icons created by Radhe Icon - Flaticon
      </Link>
    </div>
  )
}

export default PrismData
