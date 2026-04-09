import { useState, useCallback } from 'react';
import { getCount } from '../services/api';

const OPS = ['CONVERT', 'COMPARE', 'ADD', 'SUBTRACT', 'DIVIDE'];

export default function useCounts() {
  const [counts, setCounts] = useState({});

  const refresh = useCallback(async () => {
    const results = await Promise.allSettled(OPS.map(op => getCount(op)));
    const map = {};
    results.forEach((r, i) => {
      map[OPS[i]] = r.status === 'fulfilled' ? (r.value.data.count ?? 0) : '–';
    });
    setCounts(map);
  }, []);

  return { counts, refresh };
}
