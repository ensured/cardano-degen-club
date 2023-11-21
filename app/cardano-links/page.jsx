import CardanoLinks from "@/components/CardanoLinks"
import RecentCommitToastComponent from "@/components/RecentCommitToastComponent"

export const metadata = {
  title: "Cardano Links",
}

const page = () => {
  return (
    <>
      <div className="container mx-auto px-2 py-4">
        <CardanoLinks />
      </div>
    </>
  )
}

export default page
