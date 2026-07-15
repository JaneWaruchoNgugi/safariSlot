//
// export type BetHistoryItem = {
//     id: number;
//     bet: number;
//     result: "Win" | "Lose";
//     payout: number;
// };
//
// const dummyHistory: BetHistoryItem[] = [
//     { id: 1, bet: 50, result: "Win", payout: 200},
//     { id: 2, bet: 100, result: "Lose", payout: 0},
//     { id: 3, bet: 20, result: "Win", payout: 60},
//     { id: 4, bet: 200, result: "Lose", payout: 0},
//     { id: 5, bet: 50, result: "Win", payout: 150},
// ];
//
// export const BetHistory = () => {
//     return (
//         <div className="bet-history">
//             <h2 className="history-title">Bet History</h2>
//             <table className="history-table">
//                 <thead>
//                 <tr>
//                     <th>Bet</th>
//                     <th>Result</th>
//                     <th>Payout</th>
//                 </tr>
//                 </thead>
//                 <tbody>
//                 {dummyHistory.map((item) => (
//                     <tr key={item.id} className={item.result === "Win" ? "row-win" : "row-lose"}>
//                         <td>Ksh {item.bet}</td>
//                         <td>{item.result}</td>
//                         <td>{item.result === "Win" ? `+Ksh ${item.payout}` : `-`}</td>
//                     </tr>
//                 ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// };
