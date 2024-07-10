import "./Table.css";

const RouletteTable = ({ placeBet }) => {
  const getColor = (num) => {
    if (num === 0) return "bg-green-500"; // 0 is usually green
    const redNumbers = [
      1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
    ];
    const blackNumbers = [
      2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
    ];
    if (redNumbers.includes(num)) return "bg-red-500 text-white";
    if (blackNumbers.includes(num)) return "bg-black text-white";
    return "bg-gray-200"; // Default color for safety
  };

  return (
    <div
      className="grid grid-cols-6 gap-4 p-3 rounded-lg roulette-table"
      style={{ maxWidth: "400px", margin: "auto" }}
    >
      {[...Array(37).keys()].map((num) => (
        <button
          key={num}
          className={`px-4 py-2 rounded-lg font-bold ${getColor(
            num
          )} hover:bg-opacity-80`}
          onClick={() => placeBet(num)}
          style={{ minWidth: "50px", minHeight: "50px" }}
        >
          {num}
        </button>
      ))}
    </div>
  );
};

export default RouletteTable;
