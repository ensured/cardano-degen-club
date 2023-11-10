import "prismjs/themes/prism.css"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-css"

// Add other languages as needed

// Initialize Prism
if (typeof window !== "undefined") {
  require("prismjs")
  require("prismjs/components/prism-javascript")
  require("prismjs/components/prism-css") // Add other languages as needed
}
