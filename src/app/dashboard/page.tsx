'use client';
import { useEffect, useState } from 'react';
import { FormEvent } from 'react'

export default function DashboardPage() {
  console.log('entering dashboard page')

  const [bucket, setBucket] = useState('');
  const [picks, setPicks] = useState<any[]>([]);
  const [cash_balance, set_cash_balance] = useState('');
  const [invested_balance, set_invested_balance] = useState('');

  useEffect(() => {
    const storedBucket = localStorage.getItem('risk_bucket');
    const username = localStorage.getItem('username');
    const stored_cash_balance = localStorage.getItem('cash_balance');
    const stored_invested_balance = localStorage.getItem('invested_balance');
    
    if (!username || !storedBucket) {
      window.location.href = '/login';
      return;
    }

    setBucket(storedBucket);
    set_cash_balance(stored_cash_balance);
    set_invested_balance(stored_invested_balance);

    fetch('http://localhost:5050/api/dashboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ risk_bucket: storedBucket }),
    })
      .then((res) => res.json())
      .then((data) => setPicks(data.picks))
      .catch((err) => console.error('API error', err));
  }, []);

    const onSubmit = async (event: FormEvent<HTMLFormElement>) =>{
      event.preventDefault()
 
      const formData = new FormData(event.currentTarget)


      try {
          
        const submissionData = {
          username: localStorage.getItem('username'),
          bought: formData.get('bought'),
          sold: formData.get('sold'),
          deposited: formData.get('deposited'),
          withdrawn: formData.get('withdrawn')
        };
        const response = await fetch("/api/submit/modify_investment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submissionData),
        });
        if (!response.ok) throw new Error("User creation failed");

        const data = await response.json();
        localStorage.setItem("invested_balance", data.invested_balance);
        localStorage.setItem("cash_balance", data.cash_balance);
        window.location.href = "/dashboard";
        console.log('transaction completed')
        console.log("cash balance: " + localStorage.getItem('cash_balance'))
        console.log("invested balance: " + localStorage.getItem('invested_balance'))

      } catch (error) {
        console.error(error);
        alert("Submission failed");
      }
    };



  return (
    <div className="min-h-screen bg-gray-50 text-black p-8">
      <h1 className="text-4xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Profile Card */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-semibold mb-2">Risk Profile</h2>
          <p className="text-2xl font-bold text-purple-600">{bucket}</p>
          <p className="text-sm text-gray-600 mt-2">
            Your profile suggests a mix of growth and stability aligned with a{' '}
            {bucket.toLowerCase()} risk tolerance.
          </p>
        </div>

        {/* Recommended Picks Card */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recommended Holdings</h2>

          <div className="grid grid-cols-2 text-sm font-medium text-gray-700 mb-2">
            <div>Ticker</div>
            <div>Forecasted Return</div>

          </div>

          {picks.map((pick: any) => {
            const percent = pick.pred_return * 100;
            const isPositive = percent >= 0;

            return (
              <div
                key={pick.ticker}
                className="grid grid-cols-2 items-center text-sm py-2"
              >
                <div>{pick.ticker}</div>
                <div>
                  <div className="bg-gray-200 h-4 w-50 rounded overflow-hidden">
                    <div
                      className={`h-4 ${
                        isPositive ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.min(Math.abs(percent), 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {percent.toFixed(2)}%
                  </p>
                </div>
                
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-2 text-sm font-medium text-gray-700 mb-2">

        <div className="grid grid-cols-3 text-sm font-medium text-gray-700 mb-2">

          {/* Download Button */}
            <div className="mt-8">
              <a
                className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                href={`http://localhost:5050/api/download/${bucket}`}
                download
              >
                Download Picks (CSV)
              </a>
            </div>
            <div>Cash Balance: {cash_balance}</div>
            <div>Invested Balance: {invested_balance}</div>
          </div>
          <div>
            <form onSubmit={onSubmit}>
              <div className="grid grid-cols-2 text-sm font-medium text-gray-700 mb-2">
                <div><button type='submit' className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Deposit</button></div>
                <input type="number" id="deposited" name="deposited"  defaultValue='0' className="w-full mb-4 p-2 border rounded" />


                <div><button type='submit' className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Withdraw</button></div>
                <input type='number' id="withdrawn" name="withdrawn" defaultValue='0'  className="w-full mb-4 p-2 border rounded" />
              
              
                <div><button type='submit' className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Buy</button></div>
                <input type='number' id="bought" name="bought" defaultValue='0' className="w-full mb-4 p-2 border rounded" />
              
                <div><button type='submit' className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Sell</button></div>
                <input type='number' id="sold" name="sold" defaultValue='0' className="w-full mb-4 p-2 border rounded" />
              </div>
            </form>
          </div>

      </div>
    </div>
  );
}
