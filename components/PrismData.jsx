"use client"

import { useEffect } from "react"
import Prism from "prismjs"

const PrismData = () => {
  useEffect(() => {
    Prism.highlightAll()
  }, [])

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
    <>
      <div className="container mx-auto px-2 py-4 text-sm">
        <pre className="rounded-sm">
          <code className="language-javascript">{code}</code>
        </pre>
      </div>
    </>
  )
}

export default PrismData
