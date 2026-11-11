import glob

for f in glob.glob('src/views/*.tsx'):
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    updated = content.replace("from '../common/MetricBadge'", "from '../components/common/MetricBadge'")
    updated = updated.replace("from '../common/EmptyDataState'", "from '../components/common/EmptyDataState'")
    if updated != content:
        with open(f, 'w', encoding='utf-8') as fp:
            fp.write(updated)
        print('Updated:', f)
