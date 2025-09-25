import React from "react";
import { Button, Select } from "antd";

export type SelectOption = { label: string; value: string };

function SelectSearchCreate({
  disabled,
  placeholder,
  options,
  onSelect,
  onCreate,
}: {
  disabled?: boolean;
  placeholder?: string;
  options: SelectOption[];
  onSelect: (id: string) => void;
  onCreate: (label: string) => Promise<void> | void;
}) {
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return options;
    return options.filter((op) => op.label.toLowerCase().includes(s));
  }, [search, options]);

  const exists = React.useMemo(() => {
    const s = search.trim();
    if (!s) return false;
    return options.some((op) => op.label === s);
  }, [search, options]);

  return (
    <Select
      disabled={disabled}
      open={open}
      style={{ width: 300 }}
      onDropdownVisibleChange={setOpen}
      placeholder={placeholder}
      showSearch
      filterOption={false}
      onSearch={(v) => setSearch(v)}
      value={undefined as any}
      options={filtered}
      onChange={(val) => {
        onSelect(val as string);
        setSearch("");
        setOpen(false);
      }}
      dropdownRender={(menu) => (
        <div>
          {menu}
          {!disabled && search.trim() && !exists && (
            <div style={{ padding: 8 }}>
              <Button
                type="link"
                onClick={() => onCreate(search.trim())}
                style={{ padding: 0 }}
              >
                创建并选中 “{search.trim()}”
              </Button>
            </div>
          )}
        </div>
      )}
    />
  );
}

export default SelectSearchCreate;
export { SelectSearchCreate };
