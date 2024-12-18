import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { HeaderNavSheet } from "./HeaderNavSheet"
import { Progress } from "./ui/progress";
import UserButton from "./UserButton"
export async function SiteHeader() {


  const blockfrostApiKey = process.env.BLOCKFROST_API_KEY;
  const getEpochData = async () => {
    const url = `https://cardano-mainnet.blockfrost.io/api/v0/epochs/latest`;
    const response = await fetch(url, {
      headers: {
        'project_id': blockfrostApiKey
      }
    });
    const data = await response.json();
    return data; // Return the entire data object
  }

  const epochData = await getEpochData();
  const { epoch, end_time } = epochData; // Destructure the epoch and end_time

  // Calculate the time left until the epoch ends
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  let timeLeftUntilEnd = end_time - currentTime; // Time left in seconds

  // Format the time left dynamically
  let timeLeftDisplay = [];
  const days = Math.floor(timeLeftUntilEnd / 86400); // 1 day = 86400 seconds
  const hours = Math.floor((timeLeftUntilEnd % 86400) / 3600); // Remaining hours
  const minutes = Math.floor((timeLeftUntilEnd % 3600) / 60); // Remaining minutes

  if (days > 0) {
    timeLeftDisplay.push(`${days}d`);
  }
  if (hours > 0) {
    timeLeftDisplay.push(`${hours}h`);
  }
  if (minutes > 0) {
    timeLeftDisplay.push(`${minutes}m`);
  }

  // If no time left, show seconds
  if (timeLeftUntilEnd < 60) {
    timeLeftDisplay.push(`${timeLeftUntilEnd} seconds`);
  }

  // Join the display parts
  timeLeftDisplay = timeLeftDisplay.length > 0 ? timeLeftDisplay.join(' ') : 'Time is up';

  // Calculate the percentage of time left for the horizontal bar
  const totalEpochDuration = end_time - epochData.start_time; // Total duration of the epoch
  const percentageLeft = (timeLeftUntilEnd / totalEpochDuration) * 100;
  return (
    <header className="z-40 w-full overflow-x-auto border-b bg-background">
     
      <div className="flex w-full items-center gap-3 px-4 pt-4 md:px-3">
        <HeaderNavSheet />
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4 overflow-hidden">

          <nav className="flex items-center gap-1.5 text-xs">
            <UserButton />
            <ThemeToggle />
          </nav>
        </div>
        
      </div>
      <div id="epoch-time-cardano" className="flex w-full flex-col items-center overflow-hidden text-xs">
        <div className="text-xs text-muted-foreground">{epoch} ends in {timeLeftDisplay}</div>
        <div className="relative h-0.5 w-full rounded-full bg-purple-200">
          <Progress value={percentageLeft} className="bg-green-500 h-full rounded-full" />
        </div>
      </div>
    </header>
  )
}
