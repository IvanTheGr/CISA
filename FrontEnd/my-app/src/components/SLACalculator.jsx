import { useState } from "react";

const parseCustomDate = (value) => {

  if (!value) return null;

  try {

    const [datePart, timePart] = value.trim().split(" ");

    if (!datePart || !timePart) return null;

    const [year, month, day] = datePart.split("-").map(Number);

    let timeMain = timePart;
    let ms = 0;

    if (timePart.includes(".")) {
      const parts = timePart.split(".");
      timeMain = parts[0];
      ms = Number(parts[1]);
    }

    const [hour, minute, second] = timeMain.split(":").map(Number);

    return new Date(year, month - 1, day, hour, minute, second, ms);

  } catch {
    return null;
  }

};

const diffMs = (a, b) => b - a;

const msToDecimalHours = (ms) => {
  const hourMs = 1000 * 60 * 60;
  return ms / hourMs;
};

const SLACalculator = ({ openTime, startTime, closeTime }) => {

  const [result, setResult] = useState(null);

  const calculate = () => {

    const open = parseCustomDate(openTime);
    const start = parseCustomDate(startTime);
    const close = parseCustomDate(closeTime);

    if (!open || !start || !close) return;

    const responseMs = diffMs(open, start);
    const resolutionMs = diffMs(start, close);
    const firstResponseMs = responseMs;
    const totalResolutionMs = responseMs + resolutionMs;

    setResult({
      response: msToDecimalHours(responseMs),
      resolution: msToDecimalHours(resolutionMs),
      firstResponse: msToDecimalHours(firstResponseMs),
      total: msToDecimalHours(totalResolutionMs)
    });

  };

  return (

    <div className="bg-white shadow rounded-xl p-6 mt-4">

      <button
        onClick={calculate}
        className="w-full bg-blue-600 text-white p-3 rounded-xl mb-6"
      >
        Calculate
      </button>

      {result && (

        <div className="grid md:grid-cols-2 gap-4">

          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="font-semibold">
              Response Time (Open → Start) Decimal Hours
            </p>
            <p>{result.response}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="font-semibold">
              Resolution Time (Start → Close) Decimal Hours
            </p>
            <p>{result.resolution}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="font-semibold">
              First Response Time (Open → Start)
            </p>
            <p>{result.firstResponse}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="font-semibold">
              Total Resolution Time (Response + Resolution)
            </p>
            <p>{result.total}</p>
          </div>

        </div>

      )}

    </div>

  );

};

export default SLACalculator;