'use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// Direct imports of JSON files
import synergyData from '../hero_synergy.json';
import heroWinRates from '../hero_win_rates.json';

const HeroSynergyDashboard = () => {
  const [showCount, setShowCount] = useState(15);

  // Function to format tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow-md">
          <p className="font-bold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(2)}
            </p>
          ))}
          {payload[0]?.payload?.matches && (
            <p>Matches: {payload[0].payload.matches.toLocaleString()}</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Get current displayed data based on the show count
  const getDisplayData = (data: any[]) => data.slice(0, showCount);

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Hero Synergy Analysis</h1>
      
      {/* Add explanation section with formatted mathematical equations */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-2">About This Data</h2>
        <p className="text-sm text-gray-700 mb-2">
          This analysis is based on match data collected from March 7-14, 2025 via the Deadlock API. 
          Only combinations with at least 50 matches are included.
        </p>
        
        <div className="mb-3 px-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Synergy Calculation:</p>
          <div className="bg-white p-4 border border-gray-200 rounded-md flex flex-col items-center">
            <div className="mb-3 font-serif text-lg">
              Synergy(A,B) = WR<sub>actual</sub>(A,B) − WR<sub>expected</sub>(A,B)
            </div>
            <div className="font-serif text-lg">
              WR<sub>expected</sub>(A,B) = <div className="inline-block mx-1">
                <div className="border-b border-black">WR(A) + WR(B)</div>
                <div className="text-center">2</div>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-700">
          <span className="font-medium">Interpretation:</span> Positive values indicate heroes that perform better together than expected, 
          while negative values indicate underperforming combinations. The higher the synergy value, the stronger 
          the complementary relationship between heroes.
        </p>
      </div>
      
      <div className="mb-6">
        <label className="block mb-2 text-lg font-semibold">Show top:</label>
        <select 
          value={showCount} 
          onChange={(e) => setShowCount(Number(e.target.value))}
          className="border rounded p-2 bg-white"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
        </select>
      </div>

      <div className="space-y-10">
        {/* Top Synergistic Pairs */}
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Top Synergistic Hero Combinations</h2>
          <p className="mb-4 text-gray-700">Hero pairs that perform better than expected based on individual win rates</p>
          
          <div className="h-[30rem]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getDisplayData(synergyData.topSynergy)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 6]} tickCount={8} />
                <YAxis 
                  dataKey="pair" 
                  type="category" 
                  width={150}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="synergy" name="Synergy %" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Worst Synergistic Pairs */}
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Worst Synergistic Hero Combinations</h2>
          <p className="mb-4 text-gray-700">Hero pairs that perform worse than expected based on individual win rates</p>
          
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getDisplayData(synergyData.worstSynergy)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[-6, 0]} tickCount={7} />
                <YAxis 
                  dataKey="pair" 
                  type="category" 
                  width={150} 
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="synergy" name="Synergy %" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Comparison Chart */}
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Expected vs. Actual Win Rate</h2>
          <p className="mb-4 text-gray-700">Comparing expected and actual win rates for top synergistic pairs</p>
          
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getDisplayData(synergyData.topSynergy)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  domain={[45, 60]} 
                  ticks={[45, 50, 55, 60]}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  dataKey="pair" 
                  type="category" 
                  width={150} 
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="expectedWinRate" name="Expected Win %" fill="#94a3b8" />
                <Bar dataKey="actualWinRate" name="Actual Win %" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="mt-8 border-t pt-4">
        <h3 className="text-lg font-semibold mb-2">Statistical Summary</h3>
        <ul className="list-disc pl-6">
          <li>Average Synergy: {synergyData.statistics.avg.toFixed(2)}%</li>
          <li>Min Synergy: {synergyData.statistics.min.toFixed(2)}%</li>
          <li>Max Synergy: {synergyData.statistics.max.toFixed(2)}%</li>
          <li>Standard Deviation: {synergyData.statistics.std.toFixed(2)}%</li>
          <li>Total Combinations Analyzed: {synergyData.statistics.count}</li>
        </ul>
      </div>
    </div>
  );
};

export default HeroSynergyDashboard; 