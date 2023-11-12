"use client"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const CardanoLinks = () => {
  const officialCardanoLinks = [
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
      name: "Cardano Foundation on YouTube",
      url: "https://www.youtube.com/channel/UCbQ9vGfezru1YRI1zDCtTGg",
    },
    {
      name: "Cardano Stack Exchange",
      url: "https://cardano.stackexchange.com/",
    },
  ]

  const otherLinks = [
    {
      name: "Cardano Blockchain Insights",
      url: "https://lookerstudio.google.com/u/0/reporting/3136c55b-635e-4f46-8e4b-b8ab54f2d460/page/p_wxcw6g0irc",
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
      name: "jpg.store",
      url: "https://jpg.store/",
    },
    {
      name: "Opencnft",
      url: "https://opencnft.io/",
    },
  ]

  const walletsLinks = [
    {
      name: "@vesprwallet",
      url: "https://vespr.xyz/",
    },
    {
      name: "@eternlwallet",
      url: "https://eternl.io/",
    },
    {
      name: "@NamiWallet",
      url: "https://namiwallet.io/",
    },
    {
      name: "@FlintWallet",
      url: "https://flint-wallet.com/",
    },
    {
      name: "@YoroiWallet",
      url: "https://yoroi-wallet.com/",
    },
    {
      name: "@GeroWallet",
      url: "https://gerowallet.io/",
    },
  ]

  const dexsLinks = [
    {
      name: "@MinswapDEX",
      url: "https://minswap.org/",
    },
    {
      name: "@wingriderscom",
      url: "https://www.wingriders.com/",
    },
    {
      name: "@SundaeSwap",
      url: "https://sundae.fi/",
    },
    {
      name: "@VyFiOfficial",
      url: "https://docs.vyfi.io/",
    },
    {
      name: "@MuesliSwapTeam",
      url: "https://muesliswap.com/",
    },
    {
      name: "@SpectrumLabs_",
      url: "https://spectrum.fi/",
    },
  ]

  const marketplacesLinks = [
    {
      name: "@jpgstoreNFT",
      url: "https://jpg.store",
    },
    {
      name: "@CswapDEX",
      url: "https://www.cswap.info/",
    },
    {
      name: "@TokenRiot",
      url: "https://tokenriot.io/",
    },
    {
      name: "@flipr_io",
      url: "https://flipr.io/",
    },
    {
      name: "@dropspot_io",
      url: "https://dropspot.io/",
    },
    {
      name: "@JamOnBread_io",
      url: "https://jamonbread.io/",
    },
  ]

  const chartsAnalyticsLinks = [
    {
      name: "@TapTools",
      url: "https://taptools.io",
    },
    {
      name: "cnft.tools",
      url: "https://cnft.tools/",
    },
  ]

  const lendingBorrowingLinks = [
    {
      name: "@LenfiOfficial",
      url: "https://lenfi.io/",
    },
    {
      name: "@liqwidfinance",
      url: "https://liqwid.finance/",
    },
    {
      name: "@levvyfinance",
      url: "https://levvy.fi/",
    },
    {
      name: "@FluidTokens",
      url: "https://fluidtokens.com/",
    },
    {
      name: "@Cherry_Lend",
      url: "https://cherrylend.org/",
    },
    {
      name: "@LendingPond",
      url: "https://pond.markets/",
    },
    {
      name: "@yamfore",
      url: "https://www.yamfore.com/",
    },
    {
      name: "@paribus_io",
      url: "https://paribus.io/",
    },
  ]

  const yieldAggregatorsLinks = [
    {
      name: "@OptimFi",
      url: "https://optimfi.com/",
    },
    {
      name: "@stargazer_fi",
      url: "https://stargazer.fi/",
    },
    {
      name: "@GeniusyieldO",
      url: "https://app.geniusyield.co/",
    },
    {
      name: "@VyFiOfficial",
      url: "https://docs.vyfi.io/",
    },
  ]

  const stablecoinsLinks = [
    {
      name: "@Indigo_protocol",
      url: "https://indigoprotocol.io/",
    },
    {
      name: "@DjedStablecoin",
      url: "https://djed.xyz/",
    },
    {
      name: "@MehenOfficial",
      url: "https://mehen.io/",
    },
  ]

  const privacyLinks = [
    {
      name: "@ENCOINS1",
      url: "https://encoins.io/",
    },
  ]

  const syntheticProtocolsLinks = [
    {
      name: "@Indigo_protocol",
      url: "https://indigoprotocol.io/",
    },
    {
      name: "@butaneprotocol",
      url: "https://butane.dev/",
    },
  ]

  const oraclesLinks = [
    {
      name: "@Oraclecharli3",
      url: "https://charli3.io/",
    },
    {
      name: "@orcfax",
      url: "https://orcfax.io/",
    },
  ]

  const memecoinsLinks = [
    {
      name: "@snekcoinada",
      url: "https://www.snek.com/",
    },
    {
      name: "@hoskytoken",
      url: "https://hosky.io/",
    },
    {
      name: "@stablecoinada",
      url: "https://www.stablecoinada.xyz/",
    },
    {
      name: "@BankercoinAda",
      url: "https://bankercoinada.com/",
    },
  ]

  const metaverseLinks = [
    {
      name: "@Pavia_io",
      url: "https://www.pavia.io/",
    },
    {
      name: "@CornucopiasGame",
      url: "https://cornucopias.io/",
    },
    {
      name: "@claymates",
      url: "https://www.claynation.io/",
    },
    {
      name: "@VirtuaMetaverse",
      url: "https://virtua.com/",
    },
  ]

  return (
    <div className="container mx-auto px-2 py-4 break-all">
      <Tabs
        defaultValue="1"
        className="break-all"
        style={{ display: "flex", flexWrap: "wrap" }}
      >
        <TabsList>
          <TabsTrigger value="1">Official Cardano Links</TabsTrigger>
          <TabsTrigger value="2">Wallets</TabsTrigger>
          <TabsTrigger value="3">Dexs</TabsTrigger>
          <TabsTrigger value="4">Marketplaces</TabsTrigger>
          <TabsTrigger value="6">Charts/Analytics</TabsTrigger>
          <TabsTrigger value="5">Metaverse</TabsTrigger>
          <TabsTrigger value="7">Lending/Borrowing</TabsTrigger>
          <TabsTrigger value="8">Lending/Borrowing</TabsTrigger>
          <TabsTrigger value="9">Stable Coins</TabsTrigger>
          <TabsTrigger value="10">Privacy</TabsTrigger>
          <TabsTrigger value="11">Synthetic Protocols</TabsTrigger>
          <TabsTrigger value="12">Oracles</TabsTrigger>
          <TabsTrigger value="13">Meme Coins</TabsTrigger>
          <TabsTrigger value="14">Other</TabsTrigger>
        </TabsList>
        <TabsContent value="1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {officialCardanoLinks.map((link, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{link.name}</TableCell>
                  <TableCell>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.url}
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {walletsLinks.map((link, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{link.name}</TableCell>
                  <TableCell>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.url}
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dexsLinks.map((link, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{link.name}</TableCell>
                  <TableCell>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.url}
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marketplacesLinks.map((link, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{link.name}</TableCell>
                  <TableCell>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.url}
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chartsAnalyticsLinks.map((link, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{link.name}</TableCell>
                  <TableCell>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.url}
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="7">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lendingBorrowingLinks.map((link, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{link.name}</TableCell>
                  <TableCell>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.url}
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="14">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {otherLinks.map((link, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{link.name}</TableCell>
                  <TableCell>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.url}
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {yieldAggregatorsLinks.map((link, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{link.name}</TableCell>
                  <TableCell>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.url}
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="9">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stablecoinsLinks.map((link, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{link.name}</TableCell>
                  <TableCell>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.url}
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {privacyLinks.map((link, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{link.name}</TableCell>
                  <TableCell>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.url}
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="11">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {syntheticProtocolsLinks.map((link, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{link.name}</TableCell>
                  <TableCell>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.url}
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="12">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {oraclesLinks.map((link, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{link.name}</TableCell>
                  <TableCell>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.url}
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="13">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memecoinsLinks.map((link, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{link.name}</TableCell>
                  <TableCell>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.url}
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metaverseLinks.map((link, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{link.name}</TableCell>
                  <TableCell>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.url}
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CardanoLinks
