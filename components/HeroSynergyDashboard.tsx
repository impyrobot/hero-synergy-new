'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateSynergy } from '../utils/synergyCalculator';

const HeroSynergyDashboard = () => {
  const [showCount, setShowCount] = useState(15);
  const [data, setData] = useState<{
    topSynergy: any[];
    worstSynergy: any[];
    topWeightedSynergy: any[];
    statistics: {
      averageSynergy: number;
      minSynergy: number;
      maxSynergy: number;
      standardDeviation: number;
      totalCombinations: number;
    };
  } | null>(null);

  useEffect(() => {
    // In a real application, you would fetch this data from an API
    // For now, we'll use a sample data string
    const sampleData = `Hero Combination	Win Rate	Matches	Kills	Deaths	Assists
Calico, Seven	58.78%	17,559	8,234	6,789	12,456
Seven, Vyper	58.40%	5,781	2,890	2,345	4,567
Dynamo, Seven	56.86%	12,509	5,890	4,890	9,234
Holliday, Seven	56.48%	10,800	5,123	4,234	7,890
Seven, Wraith	57.26%	13,493	6,345	5,234	9,876
Abrams, Seven	56.87%	15,855	7,234	6,123	11,234
Mo & Krill, Seven	57.07%	15,498	7,123	5,890	10,987
Seven, Sinclair	56.14%	6,300	2,945	2,456	4,567
Paradox, Seven	56.11%	12,494	5,890	4,890	9,123
Lash, Seven	56.67%	28,551	13,456	11,234	20,456
Ivy, Seven	56.74%	9,956	4,678	3,890	7,234
Seven, Warden	56.28%	12,273	5,789	4,789	8,901
Lash, Vyper	54.86%	8,170	3,789	3,234	6,123
Seven, Yamato	55.88%	11,104	5,234	4,345	8,123
Lady Geist, Seven	55.67%	11,515	5,456	4,567	8,456
Infernus, McGinnis	40.94%	2,907	1,234	1,890	3,456
Infernus, Shiv	40.94%	10,612	4,567	5,890	10,234
Infernus, Pocket	42.44%	6,855	2,890	3,456	6,234
Bebop, Infernus	42.46%	14,660	6,234	7,890	14,567
Holliday, McGinnis	44.49%	1,915	890	1,234	2,345
Infernus, Sinclair	43.75%	4,409	1,890	2,345	4,234
Grey Talon, Infernus	43.07%	9,225	3,890	4,567	8,234
McGinnis, Viscous	43.49%	2,067	890	1,234	2,345
McGinnis, Sinclair	44.57%	1,290	567	789	1,456
Infernus, Mirage	43.64%	7,005	2,945	3,456	6,234
Infernus, Kelvin	43.72%	5,553	2,345	2,789	5,123
Infernus, Viscous	43.18%	6,938	2,890	3,345	6,123
Haze, Infernus	43.91%	16,216	6,789	7,890	14,567
Shiv, Yamato	45.01%	5,606	2,456	2,890	5,234
Infernus, Paradox	44.35%	8,502	3,567	4,123	7,456`;

    const calculatedData = calculateSynergy(sampleData);
    setData(calculatedData);
  }, []);

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

  if (!data) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">Hero Synergy Analysis</h1>
      
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
          
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getDisplayData(data.topSynergy)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 6]} tickCount={7} />
                <YAxis dataKey="pair" type="category" width={150} />
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
                data={getDisplayData(data.worstSynergy)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[-6, 0]} tickCount={7} />
                <YAxis dataKey="pair" type="category" width={150} />
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
                data={getDisplayData(data.topSynergy)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[45, 60]} tickCount={7} />
                <YAxis dataKey="pair" type="category" width={150} />
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
          <li>Average Synergy: {data.statistics.averageSynergy.toFixed(2)}%</li>
          <li>Min Synergy: {data.statistics.minSynergy.toFixed(2)}%</li>
          <li>Max Synergy: {data.statistics.maxSynergy.toFixed(2)}%</li>
          <li>Standard Deviation: {data.statistics.standardDeviation.toFixed(2)}%</li>
          <li>Total Combinations Analyzed: {data.statistics.totalCombinations}</li>
        </ul>
      </div>
    </div>
  );
};

export default HeroSynergyDashboard; 