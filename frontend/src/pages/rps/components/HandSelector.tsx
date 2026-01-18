import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import type { RpsHand } from '../../../api/types';

/**
 * 自分の手の選択 UI（MUI Select）。
 */
export function HandSelector(props: {
  value: RpsHand;
  disabled: boolean;
  onChange: (value: RpsHand) => void;
}) {
  const { value, disabled, onChange } = props;

  return (
    <FormControl fullWidth>
      <InputLabel id="hand-label">自分の手</InputLabel>
      <Select
        labelId="hand-label"
        value={value}
        label="自分の手"
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as RpsHand)}
      >
        <MenuItem value="ROCK">ROCK</MenuItem>
        <MenuItem value="PAPER">PAPER</MenuItem>
        <MenuItem value="SCISSORS">SCISSORS</MenuItem>
      </Select>
    </FormControl>
  );
}
