import requests
import json
import math
from datetime import datetime, timedelta
import time

def fetch_heroes():
    """Fetch hero data from the API."""
    print("🔍 Fetching heroes data...")
    try:
        response = requests.get("https://assets.deadlock-api.com/v2/heroes?only_active=true")
        response.raise_for_status()
        heroes_data = response.json()
        
        hero_map = {hero["id"]: hero["name"] for hero in heroes_data}
        print(f"✅ Successfully fetched data for {len(hero_map)} heroes")
        return hero_map
    except Exception as e:
        print(f"❌ Error fetching heroes: {e}")
        return {}

def fetch_hero_combinations(min_date, max_date):
    """Fetch hero combination stats from the API."""
    print("🔍 Fetching hero combination stats...")
    
    # Convert dates to unix timestamps
    min_timestamp = int(min_date.timestamp())
    max_timestamp = int(max_date.timestamp())
    
    params = {
        "comb_size": "2",
        "min_total_matches": "50",  # Lower threshold for more data
        "sorted_by": "winrate",
        "min_badge_level": "0",     # Include all badge levels
        "max_badge_level": "116",
        "min_unix_timestamp": str(min_timestamp),
        "max_unix_timestamp": str(max_timestamp),
    }
    
    try:
        url = "https://analytics.deadlock-api.com/v2/hero-combs-win-loss-stats"
        print(f"📡 API request to: {url}")
        print(f"📅 Date range: {min_date.strftime('%Y-%m-%d')} to {max_date.strftime('%Y-%m-%d')}")
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        combos_data = response.json()
        
        print(f"✅ Successfully fetched {len(combos_data)} hero combinations")
        return combos_data
    except Exception as e:
        print(f"❌ Error fetching hero combinations: {e}")
        return []

def calculate_hero_win_rates(combos):
    """Calculate individual hero win rates from combination data."""
    print("🧮 Calculating individual hero win rates...")
    
    # Track wins and matches for each hero
    hero_wins = {}
    hero_matches = {}
    
    # Count wins and matches across all combinations
    for combo in combos:
        for hero_id in combo["hero_ids"]:
            if hero_id not in hero_wins:
                hero_wins[hero_id] = 0
                hero_matches[hero_id] = 0
            
            hero_wins[hero_id] += combo["wins"]
            hero_matches[hero_id] += combo["matches"]
    
    # Calculate win rates
    win_rates = {}
    for hero_id, matches in hero_matches.items():
        if matches > 0:
            win_rates[hero_id] = hero_wins[hero_id] / matches
    
    print(f"✅ Calculated win rates for {len(win_rates)} heroes")
    return win_rates

def calculate_synergy(combos, hero_rates, hero_names):
    """Calculate synergy scores for hero combinations."""
    print("🧮 Calculating synergy scores...")
    
    # Filter to pairs where we have win rate data for both heroes
    valid_pairs = [
        combo for combo in combos 
        if len(combo["hero_ids"]) == 2 
        and combo["hero_ids"][0] in hero_rates 
        and combo["hero_ids"][1] in hero_rates
    ]
    
    print(f"🔍 Found {len(valid_pairs)} valid pairs with win rate data out of {len(combos)} total combinations")
    
    valid_combos = []
    
    for combo in valid_pairs:
        id1, id2 = combo["hero_ids"]
        
        win_rate1 = hero_rates[id1]
        win_rate2 = hero_rates[id2]
        
        actual_win_rate = combo["wins"] / combo["matches"]
        expected_win_rate = (win_rate1 + win_rate2) / 2
        synergy_score = actual_win_rate - expected_win_rate
        
        # Weighted score gives more emphasis to commonly played combinations
        weighted_score = synergy_score * math.log10(combo["matches"])
        
        hero1_name = hero_names.get(id1, f"Hero #{id1}")
        hero2_name = hero_names.get(id2, f"Hero #{id2}")
        
        valid_combos.append({
            "pair": f"{hero1_name}, {hero2_name}",
            "hero1": hero1_name,
            "hero2": hero2_name,
            "actualWinRate": actual_win_rate * 100,
            "expectedWinRate": expected_win_rate * 100,
            "synergy": synergy_score * 100,
            "matches": combo["matches"],
            "weightedScore": weighted_score
        })
    
    # Sort by synergy scores
    top_synergy = sorted(valid_combos, key=lambda x: x["synergy"], reverse=True)[:20]
    worst_synergy = sorted(valid_combos, key=lambda x: x["synergy"])[:20]
    
    # Calculate statistics
    synergy_values = [c["synergy"] for c in valid_combos]
    avg = sum(synergy_values) / len(synergy_values) if synergy_values else 0
    min_val = min(synergy_values) if synergy_values else 0
    max_val = max(synergy_values) if synergy_values else 0
    
    # Standard deviation
    variance = sum((x - avg) ** 2 for x in synergy_values) / len(synergy_values) if synergy_values else 0
    std = math.sqrt(variance)
    
    print(f"✅ Synergy calculation complete. Found {len(valid_combos)} valid combinations")
    
    return {
        "topSynergy": top_synergy,
        "worstSynergy": worst_synergy,
        "statistics": {
            "avg": avg,
            "min": min_val,
            "max": max_val,
            "std": std,
            "count": len(valid_combos)
        }
    }

def print_hero_win_rates(hero_rates, hero_names, top_n=10):
    """Print the top N heroes by win rate."""
    print("\n📊 Top Heroes by Win Rate:")
    print("---------------------------")
    
    hero_list = [
        {"id": hero_id, "name": hero_names.get(hero_id, f"Hero #{hero_id}"), "winRate": win_rate}
        for hero_id, win_rate in hero_rates.items()
    ]
    
    sorted_heroes = sorted(hero_list, key=lambda x: x["winRate"], reverse=True)
    
    for i, hero in enumerate(sorted_heroes[:top_n], 1):
        print(f"{i}. {hero['name']}: {hero['winRate']*100:.2f}%")

def print_synergy_results(synergy_data, top_n=10):
    """Print synergy results."""
    stats = synergy_data["statistics"]
    
    print("\n📊 Synergy Statistics:")
    print("----------------------")
    print(f"Average Synergy: {stats['avg']:.2f}%")
    print(f"Min Synergy: {stats['min']:.2f}%")
    print(f"Max Synergy: {stats['max']:.2f}%")
    print(f"Standard Deviation: {stats['std']:.2f}%")
    print(f"Total Combinations: {stats['count']}")
    
    print("\n🔝 Top Synergistic Hero Combinations:")
    print("------------------------------------")
    for i, combo in enumerate(synergy_data["topSynergy"][:top_n], 1):
        print(f"{i}. {combo['pair']}")
        print(f"   Actual: {combo['actualWinRate']:.2f}% | Expected: {combo['expectedWinRate']:.2f}% | Synergy: +{combo['synergy']:.2f}%")
        print(f"   Matches: {combo['matches']}")
    
    print("\n👎 Worst Synergistic Hero Combinations:")
    print("--------------------------------------")
    for i, combo in enumerate(synergy_data["worstSynergy"][:top_n], 1):
        print(f"{i}. {combo['pair']}")
        print(f"   Actual: {combo['actualWinRate']:.2f}% | Expected: {combo['expectedWinRate']:.2f}% | Synergy: {combo['synergy']:.2f}%")
        print(f"   Matches: {combo['matches']}")

def save_to_json(data, filename):
    """Save data to a JSON file."""
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"💾 Data saved to {filename}")

def main():
    print("🚀 Starting Deadlock Hero Synergy Analysis")
    start_time = time.time()
    
    # Set the date range: March 7, 2025 to March 14, 2025
    min_date = datetime(2025, 3, 7)
    max_date = datetime(2025, 3, 14)
    
    # 1. Fetch heroes
    hero_names = fetch_heroes()
    if not hero_names:
        print("❌ Cannot proceed without hero data")
        return
    
    # 2. Fetch hero combinations
    combos = fetch_hero_combinations(min_date, max_date)
    if not combos:
        print("❌ Cannot proceed without combination data")
        return
    
    # 3. Calculate hero win rates
    hero_rates = calculate_hero_win_rates(combos)
    
    # 4. Print top heroes by win rate
    print_hero_win_rates(hero_rates, hero_names)
    
    # 5. Calculate synergy
    synergy_data = calculate_synergy(combos, hero_rates, hero_names)
    
    # 6. Print synergy results
    print_synergy_results(synergy_data)
    
    # 7. Save data to files
    save_to_json(hero_rates, "hero_win_rates.json")
    save_to_json(synergy_data, "hero_synergy.json")
    
    end_time = time.time()
    print(f"\n✅ Analysis completed in {end_time - start_time:.2f} seconds")

if __name__ == "__main__":
    main()