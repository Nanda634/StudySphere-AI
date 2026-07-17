import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import StatCard from "../../components/common/StatCard";

export default function Coins() {
  const [data, setData] = useState({ balance: 0, transactions: [] });

  useEffect(() => {
    api.get("/coins").then((r) => setData(r.data));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl mb-1">Your Coins</h1>
      <p className="text-ink2 mb-6">
        Earn coins by completing quizzes — easy quizzes earn a little, hard ones earn more. Spend
        them to unlock <Link to="/student/mock-exams" className="text-glow hover:underline">real-world mock exams</Link>.
      </p>

      <div className="mb-8">
        <StatCard label="Coin balance" value={`🪙 ${data.balance}`} sub="Earned from quizzes and exams" />
      </div>

      <h2 className="font-display text-xl mb-3">Recent activity</h2>
      {data.transactions.length === 0 ? (
        <p className="text-ink2 bg-panel rounded-2xl p-6">No coin activity yet — complete a quiz to start earning.</p>
      ) : (
        <div className="space-y-2">
          {data.transactions.map((t) => (
            <div key={t.id} className="bg-panel rounded-xl px-5 py-3 flex items-center justify-between">
              <span className="text-sm">{t.reason}</span>
              <span className={`font-mono text-sm ${t.amount >= 0 ? "text-teal" : "text-coral"}`}>
                {t.amount >= 0 ? "+" : ""}{t.amount}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
