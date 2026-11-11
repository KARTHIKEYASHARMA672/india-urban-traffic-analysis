import pandas as pd
import json
import re

excel_file = 'India_Urban_Traffic_Congestion_Analysis_2015-2025.xlsx'
xl = pd.ExcelFile(excel_file)
data = {}

for name in xl.sheet_names:
    raw_df = xl.parse(name, header=None)
    header_idx = -1
    for r in range(min(10, len(raw_df))):
        row_vals = [str(x).strip() for x in raw_df.iloc[r].tolist() if pd.notna(x)]
        combined = ' '.join(row_vals).lower()
        if len(row_vals) >= 2 and any(k in combined for k in [
            'year', 'city', 'state', 'name', 'source', 'claim', '#', 'vehicle', 'weather', 'highway', 'time window', 'total', 'traffic'
        ]):
            header_idx = r
            break
    
    if header_idx != -1:
        cols = [str(x).strip() if pd.notna(x) else f'Col_{i}' for i, x in enumerate(raw_df.iloc[header_idx].tolist())]
        cleaned_cols = []
        for i, c in enumerate(cols):
            c_clean = re.sub(r'[\r\n\t]+', ' ', c).strip()
            if not c_clean or c_clean == 'nan':
                c_clean = f'Col_{i}'
            cleaned_cols.append(c_clean)
        
        rows = []
        for r in range(header_idx + 1, len(raw_df)):
            row_dict = {}
            has_val = False
            for col_idx, col_name in enumerate(cleaned_cols):
                if col_name.startswith('Col_') or col_name.startswith('nan'):
                    continue
                val = raw_df.iloc[r, col_idx]
                if pd.isna(val) or val == '' or str(val).strip() == 'nan':
                    row_dict[col_name] = None
                else:
                    has_val = True
                    if isinstance(val, (int, float)):
                        row_dict[col_name] = float(val) if isinstance(val, float) and not float(val).is_integer() else int(val)
                    else:
                        row_dict[col_name] = str(val).strip()
            if has_val and any(v is not None for v in row_dict.values()):
                rows.append(row_dict)
        data[name] = {
            'sheet': name,
            'headerRow': header_idx,
            'columns': [c for c in cleaned_cols if not c.startswith('Col_') and not c.startswith('nan')],
            'rowCount': len(rows),
            'rows': rows
        }
    else:
        data[name] = {'sheet': name, 'headerRow': -1, 'columns': [], 'rowCount': 0, 'rows': []}

with open('all_sheets_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print('Successfully exported all sheets:')
for k, v in data.items():
    print(f"- {k}: {v['rowCount']} rows | columns: {', '.join(v['columns'][:4])}")
