import re
import json

def parse_srd_text(text):
    """
    Parses the raw text of the Daggerheart SRD to extract adversary stat blocks.
    """
    adversaries = []

    # This regex splits the text into blocks using the adversary name and Tier line as a delimiter.
    # It looks for a name (all caps, can include spaces, hyphens, etc.), a newline,
    # then "Tier X [Type]".
    adversary_blocks = re.split(
        r'\n([A-Z][A-Z\s\':-]+)\nTier (\d)\s(Solo|Bruiser|Horde|Leader|Minion|Ranged|Skulk|Social|Standard|Support)',
        text
    )

    # The first element is the text before the first match, so we skip it.
    # The matches come in groups of 4: (Full Match, Name, Tier, Type), followed by the block text.
    for i in range(1, len(adversary_blocks), 4):
        name = adversary_blocks[i].strip()
        tier = int(adversary_blocks[i+1])
        adv_type = adversary_blocks[i+2].strip()
        block_text = adversary_blocks[i+3]

        print(f"Parsing adversary: {name}...")

        try:
            adversary_data = {
                "name": name,
                "tier": tier,
                "type": adv_type,
            }

            # --- Battle Points Mapping (from SRD pg. 71) ---
            battle_points_map = {
                "Minion": 1, "Social": 1, "Support": 1,
                "Horde": 2, "Ranged": 2, "Skulk": 2, "Standard": 2,
                "Leader": 3,
                "Bruiser": 4,
                "Solo": 5
            }
            adversary_data["battle_points"] = battle_points_map.get(adv_type, 0)

            # --- Description, Motives ---
            desc_match = re.search(r'(.+?)\nMotives & Tactics:\s*(.+?)\n', block_text, re.DOTALL)
            if desc_match:
                adversary_data["description"] = desc_match.group(1).strip().replace('\n', ' ')
                adversary_data["motives"] = desc_match.group(2).strip()
            else:
                 adversary_data["description"] = ""
                 adversary_data["motives"] = ""

            # --- Core Stats ---
            stats_match = re.search(r'Difficulty:\s*(\d+)\s*\|\s*Thresholds:\s*(None|\d+\/\d+)\s*\|\s*HP:\s*(\d+)\s*\|\s*Stress:\s*(\d+)', block_text)
            if stats_match:
                adversary_data["difficulty"] = int(stats_match.group(1))
                thresholds_str = stats_match.group(2)
                if thresholds_str == "None":
                    adversary_data["thresholds"] = None
                else:
                    major, severe = thresholds_str.split('/')
                    adversary_data["thresholds"] = {"major": int(major), "severe": int(severe)}
                adversary_data["hp"] = int(stats_match.group(3))
                adversary_data["stress"] = int(stats_match.group(4))

            # --- Attack ---
            # Handles both "ATK: +1 | Name: Range | Damage" and "ATK: +1 Name: Range Damage"
            attack_match = re.search(r'ATK:\s*([+-]?\d+)\s*(?:\|)?\s*(.+?):\s*(Melee|Very Close|Close|Far|Very Far)\s*(?:\|)?\s*(.+)', block_text)
            if attack_match:
                 adversary_data["attack_modifier"] = attack_match.group(1).strip()
                 adversary_data["standard_attack"] = {
                     "name": attack_match.group(2).strip(),
                     "range": attack_match.group(3).strip(),
                     "damage": attack_match.group(4).strip().replace('|', '').strip()
                 }
            else:
                adversary_data["standard_attack"] = None

            # --- Experience (Optional) ---
            exp_match = re.search(r'Experience:\s*(.+?)\s*([+-]\d+)', block_text)
            if exp_match:
                adversary_data["experience"] = {
                    "name": exp_match.group(1).strip(),
                    "modifier": int(exp_match.group(2))
                }
            else:
                adversary_data["experience"] = None

            # --- Features ---
            features_text_match = re.search(r'FEATURES\n(.+)', block_text, re.DOTALL)
            if features_text_match:
                features_text = features_text_match.group(1)
                # Split features by looking for a newline followed by "Name - Type:"
                feature_splits = re.split(r'\n([A-Z][\w\s\(\)\'-]+? - (?:Action|Reaction|Passive):)', features_text)

                parsed_features = []
                for j in range(1, len(feature_splits), 2):
                    header = feature_splits[j]
                    description = feature_splits[j+1].strip().replace('\n', ' ')

                    header_match = re.match(r'([\w\s\(\)\'-]+?) - (Action|Reaction|Passive):', header)
                    if header_match:
                        feat_name = header_match.group(1).strip()
                        feat_type = header_match.group(2).strip()
                        parsed_features.append({
                            "name": feat_name,
                            "type": feat_type,
                            "description": description
                        })
                adversary_data["features"] = parsed_features
            else:
                adversary_data["features"] = []

            adversaries.append(adversary_data)
        except Exception as e:
            print(f"--- FAILED to parse '{name}': {e} ---")
            print(f"Problematic Block Text: \n{block_text[:250]}...\n")

    return adversaries

if __name__ == "__main__":
    input_filename = 'srd_adversaries.txt'
    output_filename = 'adversaries.json'

    try:
        with open(input_filename, 'r', encoding='utf-8') as f:
            srd_text = f.read()
    except FileNotFoundError:
        print(f"Error: Input file '{input_filename}' not found.")
        print("Please create this file and paste the adversary stat blocks from the Daggerheart SRD PDF into it.")
        print("Follow the steps in instructions.md for more details.")
        exit(1)

    # Pre-process text to clean up common copy-paste issues from the PDF
    srd_text = re.sub(r'Daggerheart SRD\s+\d+', '', srd_text)  # Remove page footers
    srd_text = "\n" + srd_text # Ensure the first block is found

    parsed_data = parse_srd_text(srd_text)

    with open(output_filename, 'w', encoding='utf-8') as f:
        json.dump(parsed_data, f, indent=2)

    print(f"\nSuccessfully parsed {len(parsed_data)} adversaries.")
    print(f"Data saved to '{output_filename}'.")
    print("IMPORTANT: Please review the output file for any parsing errors and correct them manually.")
