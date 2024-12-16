import { DividerVerticalIcon } from "@radix-ui/react-icons"
import HeroLandingPage from "../components/HeroLandingPage"

export const metadata = {
  title: "Cardano Resources | Learn About Web3 and Blockchain",
  description: "Explore Cardano blockchain resources, tools, and educational content. Learn about Web3, cryptocurrency, and decentralized finance.",
  keywords: "Cardano, Web3, blockchain, cryptocurrency, DeFi, education, resources, cypherpunk, decentralization, decentralized",
  openGraph: {
    title: "Cardano Resources | Learn About Web3 and Blockchain",
    description: "Explore Cardano blockchain resources, tools, and educational content.",
    type: "website",
  },
}

export default async function IndexPage() {
  return (
    <main>
      <HeroLandingPage />
    </main>
  )
}
