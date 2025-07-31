import React from 'react';
import { Rule, RuleType } from '../utils/notificationRules';

interface Props {
  rules: Rule[];
  onChange: (rules: Rule[]) => void;
}

const comparators: Array<Rule['comparator']> = ['>', '>=', '<', '<=', '=='];
const types: RuleType[] = ['temperature', 'precipitation', 'humidity'];

/**
 * Component for editing a list of notification rules. Allows adding,
 * modifying and removing rules. Changes are propagated up via onChange.
 */
const RuleEditor: React.FC<Props> = ({ rules, onChange }) => {
  function handleAdd() {
    const newRule: Rule = {
      type: 'temperature',
      comparator: '>',
      threshold: 25,
      durationHours: 1,
    };
    onChange([...rules, newRule]);
  }

  function handleUpdate(index: number, partial: Partial<Rule>) {
    const updated = rules.map((r, i) => (i === index ? { ...r, ...partial } : r));
    onChange(updated);
  }

  function handleRemove(index: number) {
    const updated = rules.filter((_, i) => i !== index);
    onChange(updated);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {rules.map((rule, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            value={rule.type}
            onChange={(e) => handleUpdate(idx, { type: e.target.value as RuleType })}
            style={{ padding: 4, borderRadius: 4, backgroundColor: '#2A2A3D', color: '#FFFFFF', border: 'none' }}
          >
            {types.map((t) => (
              <option key={t} value={t} style={{ color: '#000' }}>{t}</option>
            ))}
          </select>
          <select
            value={rule.comparator}
            onChange={(e) => handleUpdate(idx, { comparator: e.target.value as any })}
            style={{ padding: 4, borderRadius: 4, backgroundColor: '#2A2A3D', color: '#FFFFFF', border: 'none' }}
          >
            {comparators.map((c) => (
              <option key={c} value={c} style={{ color: '#000' }}>{c}</option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            value={rule.threshold}
            onChange={(e) => handleUpdate(idx, { threshold: parseFloat(e.target.value) })}
            style={{ width: 60, padding: 4, borderRadius: 4, backgroundColor: '#2A2A3D', color: '#FFFFFF', border: 'none' }}
          />
          <span style={{ color: '#BBBBCC' }}>po dobu</span>
          <input
            type="number"
            min="1"
            value={rule.durationHours}
            onChange={(e) => handleUpdate(idx, { durationHours: parseInt(e.target.value, 10) })}
            style={{ width: 50, padding: 4, borderRadius: 4, backgroundColor: '#2A2A3D', color: '#FFFFFF', border: 'none' }}
          />
          <span style={{ color: '#BBBBCC' }}>hod.</span>
          <button
            onClick={() => handleRemove(idx)}
            style={{ marginLeft: 8, backgroundColor: '#FF6B6B', border: 'none', borderRadius: 4, color: '#1E1E2A', padding: '4px 8px', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      ))}
      <button
        onClick={handleAdd}
        style={{ alignSelf: 'flex-start', backgroundColor: '#3FC1FF', border: 'none', borderRadius: 4, color: '#1E1E2A', padding: '6px 12px', cursor: 'pointer' }}
      >
        Přidat pravidlo
      </button>
    </div>
  );
};

export default RuleEditor;