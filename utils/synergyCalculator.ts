interface HeroWinRate {
  name: string;
  winRate: number;
  pickRate: number;
  totalMatches: number;
}

interface HeroCombo {
  hero1: string;
  hero2: string;
  winRate: number;
  matches: number;
  kills: number;
  deaths: number;
  assists: number;
  expectedWinRate?: number;
  synergyScore?: number;
  weightedSynergyScore?: number;
}

// Hero win rates data
const heroWinRates: HeroWinRate[] = [
  { name: "Seven", winRate: 55.49, pickRate: 74.23, totalMatches: 64462 },
  { name: "Calico", winRate: 52.42, pickRate: 60.48, totalMatches: 52523 },
  { name: "Vyper", winRate: 52.38, pickRate: 21.66, totalMatches: 18810 },
  { name: "Wraith", winRate: 51.55, pickRate: 50.45, totalMatches: 43812 },
  { name: "Ivy", winRate: 51.41, pickRate: 37.07, totalMatches: 32191 },
  { name: "Mo & Krill", winRate: 51.35, pickRate: 48.55, totalMatches: 42161 },
  { name: "Lash", winRate: 51.03, pickRate: 87.54, totalMatches: 76025 },
  { name: "Abrams", winRate: 50.89, pickRate: 49.22, totalMatches: 42742 },
  { name: "Warden", winRate: 50.58, pickRate: 38.68, totalMatches: 33594 },
  { name: "Vindicta", winRate: 50.40, pickRate: 41.43, totalMatches: 35979 },
  { name: "Yamato", winRate: 50.10, pickRate: 38.56, totalMatches: 33483 },
  { name: "Dynamo", winRate: 49.95, pickRate: 43.01, totalMatches: 37351 },
  { name: "Paradox", winRate: 49.88, pickRate: 46.43, totalMatches: 40317 },
  { name: "Holliday", winRate: 49.87, pickRate: 40.97, totalMatches: 35583 },
  { name: "Sinclair", winRate: 49.73, pickRate: 24.46, totalMatches: 21245 },
  { name: "Lady Geist", winRate: 49.70, pickRate: 42.28, totalMatches: 36719 },
  { name: "Mirage", winRate: 49.11, pickRate: 37.78, totalMatches: 32813 },
  { name: "Haze", winRate: 49.05, pickRate: 82.98, totalMatches: 72062 },
  { name: "Kelvin", winRate: 48.88, pickRate: 25.21, totalMatches: 21893 },
  { name: "Pocket", winRate: 48.81, pickRate: 37.43, totalMatches: 32501 },
  { name: "Grey Talon", winRate: 48.37, pickRate: 50.31, totalMatches: 43690 },
  { name: "Bebop", winRate: 48.34, pickRate: 76.73, totalMatches: 66631 },
  { name: "Viscous", winRate: 47.62, pickRate: 30.85, totalMatches: 26790 },
  { name: "McGinnis", winRate: 46.59, pickRate: 15.65, totalMatches: 13594 },
  { name: "Shiv", winRate: 46.28, pickRate: 45.30, totalMatches: 39336 },
  { name: "Infernus", winRate: 45.17, pickRate: 52.75, totalMatches: 45808 }
];

// Create a map for quick lookup of hero win rates
const heroWinRateMap = new Map(
  heroWinRates.map(hero => [hero.name, hero.winRate / 100])
);

export function calculateSynergy(comboData: string): {
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
} {
  // Parse the combo data
  const comboLines = comboData.trim().split('\n');
  const headers = comboLines[0].split('\t');
  const combos: HeroCombo[] = [];

  // Parse each combo line
  for (let i = 1; i < comboLines.length; i++) {
    const values = comboLines[i].split('\t');
    const heroes = values[0].split(', ');
    
    if (heroes.length !== 2) continue;
    
    const combo: HeroCombo = {
      hero1: heroes[0],
      hero2: heroes[1],
      winRate: parseFloat(values[1].replace('%', '')) / 100,
      matches: parseInt(values[2].replace(/,/g, '')),
      kills: parseInt(values[3].replace(/,/g, '')),
      deaths: parseInt(values[4].replace(/,/g, '')),
      assists: parseInt(values[5].replace(/,/g, ''))
    };
    
    combos.push(combo);
  }

  // Calculate expected win rate and synergy score for each combo
  const validCombos = combos.map(combo => {
    const winRate1 = heroWinRateMap.get(combo.hero1);
    const winRate2 = heroWinRateMap.get(combo.hero2);
    
    if (winRate1 === undefined || winRate2 === undefined) {
      return null;
    }
    
    const expectedWinRate = (winRate1 + winRate2) / 2;
    const synergyScore = combo.winRate - expectedWinRate;
    const weightedSynergyScore = synergyScore * Math.log10(combo.matches);
    
    return {
      ...combo,
      expectedWinRate,
      synergyScore,
      weightedSynergyScore,
      pair: `${combo.hero1}, ${combo.hero2}`,
      actualWinRate: combo.winRate * 100,
      expectedWinRate: expectedWinRate * 100,
      synergy: synergyScore * 100
    };
  }).filter((combo): combo is NonNullable<typeof combo> => combo !== null);

  // Sort by different criteria
  const sortedBySynergy = [...validCombos].sort((a, b) => b.synergyScore - a.synergyScore);
  const sortedByNegativeSynergy = [...validCombos].sort((a, b) => a.synergyScore - b.synergyScore);
  const sortedByWeightedSynergy = [...validCombos].sort((a, b) => b.weightedSynergyScore - a.weightedSynergyScore);

  // Calculate statistics
  const synergyValues = validCombos.map(c => c.synergyScore);
  const avg = synergyValues.reduce((sum, val) => sum + val, 0) / synergyValues.length;
  const min = Math.min(...synergyValues);
  const max = Math.max(...synergyValues);
  const std = Math.sqrt(synergyValues.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / synergyValues.length);

  return {
    topSynergy: sortedBySynergy.slice(0, 15),
    worstSynergy: sortedByNegativeSynergy.slice(0, 15),
    topWeightedSynergy: sortedByWeightedSynergy.slice(0, 15),
    statistics: {
      averageSynergy: avg * 100,
      minSynergy: min * 100,
      maxSynergy: max * 100,
      standardDeviation: std * 100,
      totalCombinations: validCombos.length
    }
  };
} 