"use client";
import { useState } from "react";
import TradingViewChart from "../../components/TradingViewChart";

const Crypto = () => {
  const [amount, setAmount] = useState(1);
  const [convertToADA, setConvertToADA] = useState(true);

  // Example conversion rates
  const adaToBtcConversionRate = 0.00002; // Example conversion rate from ADA to BTC
  const adaToSatsConversionRate = 1000000; // Example conversion rate from ADA to SATs
  const adaToLovelacesConversionRate = 100000; // Example conversion rate from ADA to lovelaces

  const btcToAdaConversionRate = 1 / adaToBtcConversionRate; // Conversion rate from BTC to ADA

  const convertToBTC = () => {
    const btcAmount = amount * adaToBtcConversionRate;
    return btcAmount.toLocaleString(); // Format the result for easy reading
  };

  const convertToSats = () => {
    const satsAmount = amount * adaToSatsConversionRate;
    return satsAmount.toLocaleString(); // Format the result for easy reading
  };

  const convertToLovelaces = () => {
    const lovelacesAmount = amount * adaToLovelacesConversionRate;
    return lovelacesAmount.toLocaleString(); // Format the result for easy reading
  };

  const convertToADAFromBTC = () => {
    const adaAmount = amount * btcToAdaConversionRate;
    return adaAmount.toLocaleString(); // Format the result for easy reading
  };

  return (
    <div className="px-2 flex flex-col justify-center items-center">
      <TradingViewChart />

      <div>
        <label>Enter {convertToADA ? "ADA" : "BTC"} amount:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <label>
          <input
            type="checkbox"
            checked={convertToADA}
            onChange={() => setConvertToADA(!convertToADA)}
          />
          Convert to ADA
        </label>

        {convertToADA ? (
          <div>
            <p>
              {amount} ADA is equal to {convertToBTC()} BTC.
            </p>
            <p>
              {amount} ADA is equal to {convertToSats()} SATs.
            </p>
            <p>
              {amount} ADA is equal to {convertToLovelaces()} lovelaces.
            </p>
          </div>
        ) : (
          <p>
            {amount} BTC is equal to {convertToADAFromBTC()} ADA.
          </p>
        )}
      </div>
    </div>
  );
};

export default Crypto;

