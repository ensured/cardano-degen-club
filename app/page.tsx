import Link from "next/link"

import { siteConfig } from "@/config/site"
import CardForm from "@/components/CardForm"

export default function IndexPage() {
  return (
    <div className="mt-8">
      <CardForm />
    </div>
  )
}
