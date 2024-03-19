import CardanoLinks from "@/components/CardanoLinks"

export const metadata = {
  title: "Cardano Links",
}

const page = () => {
  return (
    <div className="px-2 pt-2">
      <div className="flex w-full justify-center rounded-t-md  p-2 text-center text-xs text-gray-700 dark:text-slate-300 dark:text-opacity-50 md:text-sm">
        Always do your due diligence and double check any links you click
        online!
      </div>
      <CardanoLinks />
    </div>)
}

export default page
