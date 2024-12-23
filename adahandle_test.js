const policyID = "f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a"

const cleanStrings = (strings) => {
  return strings.map((str) => {
    // Remove the first '@' if it exists and then remove non-printable characters
    return str.replace(/^@/, "").replace(/[^\x20-\x7E]/g, "")
  })
}

const fetchHandles = async () => {
  const address =
    "addr1qxyj9sqrzpwq9v4ylzr3m59rzxcusdqytulpz8j8wpd7k75ya8f335kz79mf43nwquzgnylgzmt0wdyh2k2zzleh7c7qmkdw9a"

  // Fetch data about an address.
  const data = await fetch(
    `https://cardano-mainnet.blockfrost.io/api/v0/addresses/${address}`,
    {
      headers: {
        // Your Blockfrost API key
        project_id: "mainnetsh2KDyn78Z8UcKe3N7WEp6K1UaLCNRki",
        "Content-Type": "application/json",
      },
    }
  ).then((res) => res.json())

  if (data?.error) {
    console.log(data.error)
  }

  const handles = data.amount
    .filter(({ unit }) => {
      if (unit.startsWith(policyID.slice(0, 5))) {
        return unit
      }
      return null
    })
    .map(({ unit }) => {
      const hexName = unit.replace(policyID, "")
      const utf8Name = Buffer.from(hexName, "hex").toString("utf8")
      let utf8NameString = utf8Name.toString()
      return utf8NameString
    })

  const cleanedHandles = cleanStrings(handles)
  console.log(cleanedHandles.length)
}

// fetchHandles()

const getAddressFromHandle = async (handleName) => {
  // A blank Handle name should always be ignored.
  if (handleName.length === 0) {
    console.log("Handle name is empty")
    return
  }

  // Convert handleName to hex encoding.
  const assetName = Buffer.from(handleName).toString("hex")
  console.log(`${policyID}${assetName}`)

  // Fetch matching address for the asset.
  const data = await fetch(
    `https://cardano-mainnet.blockfrost.io/api/v0/assets/${policyID}${assetName}/addresses`,
    {
      headers: {
        project_id: "mainnetsh2KDyn78Z8UcKe3N7WEp6K1UaLCNRki",
        "Content-Type": "application/json",
      },
    }
  ).then((res) => res.json())

  if (data?.error) {
    console.log(data.error)
    return
  }

  try {
    const [{ address }] = data
    console.log(`${policyID}${assetName}`, address)
  } catch (e) {
    console.log(e)
  }
}

getAddressFromHandle("soil")

// works for omnivore
// f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a6f6d6e69766f7265
// doesn't work for fam
// f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a66616d
