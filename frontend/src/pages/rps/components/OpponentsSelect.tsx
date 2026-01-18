import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

/**
 * 相手人数の選択 UI（MUI Select）。
 *
 * 条件：
 * - 1〜10 の範囲に固定（仕様）
 */
export function OpponentsSelect(props: {
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  const { value, disabled, onChange } = props;

  const options = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <FormControl fullWidth size="small">
      <InputLabel id="opponents-label">相手の人数</InputLabel>
      <Select
        size="small"
        labelId="opponents-label"
        value={value}
        label="相手の人数"
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {options.map((n) => (
          <MenuItem key={n} value={n}>
            {n} 人
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
