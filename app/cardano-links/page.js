import CardanoLinks from "@/components/CardanoLinks"
import FeedBackDrawer from "@/components/FeedbackClient"

export const metadata = {
  title: "Cardano Links",
}

const page = () => {
  return (
    <div className="flex flex-col">
      <CardanoLinks />
    </div>
  )
}

export default page
