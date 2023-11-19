import CardanoLinks from "@/components/CardanoLinks"

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
