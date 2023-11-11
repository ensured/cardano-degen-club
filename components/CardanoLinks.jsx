"use client"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const CardanoLinks = () => {
  const links = [
    {
      name: "Cardano Foundation",
      url: "https://cardanofoundation.org/",
    },
    {
      name: "Cardano",
      url: "https://cardano.org/",
    },
    {
      name: "Cardano Forum",
      url: "https://forum.cardano.org/",
    },
    {
      name: "Cardano Foundation on X",
      url: "https://twitter.com/Cardano_CF",
    },
    {
      name: "Cardano Blockchain Insights",
      url: "https://lookerstudio.google.com/u/0/reporting/3136c55b-635e-4f46-8e4b-b8ab54f2d460/page/p_wxcw6g0irc",
    },
    {
      name: "Cardano Foundation on YouTube",
      url: "https://www.youtube.com/channel/UCbQ9vGfezru1YRI1zDCtTGg",
    },
    {
      name: "Cardano Cube",
      url: "https://cardanocube.com/",
    },
    {
      name: "Cardano Messari - ADA Market data",
      url: "https://messari.io/project/cardano/markets",
    },
    {
      name: "Cardano on CoinGecko",
      url: "https://www.coingecko.com/en/coins/cardano",
    },

    {
      name: "Taptools",
      url: "https://taptools.io/",
    },

    {
      name: "cnft.tools",
      url: "https://cnft.tools/",
    },

    {
      name: "jpg.store",
      url: "https://jpg.store/",
    },
    {
      name: "Opencnft",
      url: "https://opencnft.io/",
    },
  ]

  return (
    <Table>
      <TableCaption>Table to display Cardano links.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>URL</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {links.map((link, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{link.name}</TableCell>
            <TableCell>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.url}
              </a>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default CardanoLinks
