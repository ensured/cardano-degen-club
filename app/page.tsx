import Link from "next/link"

import { siteConfig } from "@/config/site"
import Search from "@/components/Search"

export default function IndexPage() {
  return (
    <div className="mt-8">
      <Search />
    </div>
  )
}
