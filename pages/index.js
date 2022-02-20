import React, { useState } from "react"
import axios from "axios"

function formatNumber(num) {
  return (
    num
      .toFixed(2)
      // .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
  )
}
const IndexPage = () => {
  const [input, setInput] = useState(null)
  const [financialData, setFinancialData] = useState(null)
  const balanceSheetData =
    financialData?.balanceSheetHistoryQuarterly?.balanceSheetStatements[0]

  const cashAndShortTermInvestments =
    balanceSheetData?.cash?.raw ||
    0 + balanceSheetData?.shortTermInvestments?.raw ||
    0
  const averageShares =
    financialData?.timeSeries?.annualDilutedAverageShares || []
  const annualBasicAverageShares =
    averageShares[averageShares.length - 1]?.reportedValue?.raw

  const getNCAVPerShare = () => {
    const netAssets =
      balanceSheetData?.totalCurrentAssets?.raw -
      balanceSheetData?.totalLiab?.raw
    const NCAV = formatNumber(netAssets / annualBasicAverageShares)
    return NCAV
  }

  const getNNWCPerShare = () => {
    // Cash and short-term investments + (0.75 x Accounts Receivable) + (0.5 x Total Inventory ) – Total Liabilities
    const NNWC = formatNumber(
      (cashAndShortTermInvestments +
        (0.75 * balanceSheetData?.netReceivables?.raw +
          0.5 * balanceSheetData?.inventory?.raw || 0) -
        balanceSheetData?.totalLiab?.raw) /
        annualBasicAverageShares
    )

    return NNWC
  }
  const getEbitTTM = () => {
    const quarterlyIncomeStatements =
      financialData?.incomeStatementHistoryQuarterly?.incomeStatementHistory ||
      []
    return quarterlyIncomeStatements.reduce((acc, statement) => {
      console.log("ebit", statement?.ebit)
      acc += statement?.ebit?.raw
      return acc
    }, 0)
  }
  const getEVToEBIT = () => {
    // const currentDebtArr = financialData?.timeSeries?.annualCurrentDebt || []
    // const annualCurrentDebt = currentDebtArr[currentDebtArr.length - 1] || {}
    // const shortTermDebt = annualCurrentDebt?.reportedValue?.raw || 0
    // const longTermDebtArr = financialData?.timeSeries?.annualLongTermDebt || []
    // const annualLongTermDebt = longTermDebtArr[longTermDebtArr.length - 1] || {}
    // const longTermDebt = annualLongTermDebt?.reportedValue?.raw || 0
    const shortTermDebt = balanceSheetData?.shortLongTermDebt?.raw || 0
    const longTermDebt = balanceSheetData?.longTermDebt?.raw || 0
    const enterpriseValue =
      financialData?.price?.marketCap?.raw +
      shortTermDebt +
      longTermDebt -
      cashAndShortTermInvestments
    const EbitTTM = getEbitTTM()

    return (enterpriseValue / EbitTTM).toFixed(2)
  }
  return (
    <div>
      <form
        onSubmit={async e => {
          e.preventDefault()
          console.log("input", input)
          try {
            const result = await axios.post("/get-financials", {
              symbol: input,
            })
            console.log("result", result)
            setFinancialData(result.data)
          } catch (err) {
            console.log("err", err)
          }
        }}
      >
        <input onChange={e => setInput(e.target.value)} type="text" />
        <button type="submit">Submit</button>
      </form>
      {financialData && (
        <div>
          <p>Stock: {financialData?.quoteType?.shortName}</p>
          <p>Market Cap: ${financialData?.price?.marketCap?.fmt}</p>
          <p>Current Price: ${financialData?.price?.regularMarketOpen?.fmt}</p>
          <p>Current Assets: ${balanceSheetData?.totalCurrentAssets?.fmt}</p>
          <p>Total Liabilities: ${balanceSheetData?.totalLiab?.fmt}</p>
          <p>
            Annual Basic Average Shares{" "}
            {averageShares[averageShares.length - 1]?.reportedValue?.fmt}
          </p>
          <p>NCAV/S: ${getNCAVPerShare()}</p>
          <p>NNWC/S: ${getNNWCPerShare()}</p>
          <p>
            Cash and Short Term Invesmtents: $
            {formatNumber(cashAndShortTermInvestments)}
          </p>
          <p>EV/EBIT(TTM): {getEVToEBIT()}</p>
        </div>
      )}
    </div>
  )
}

export default IndexPage
