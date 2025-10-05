import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../ui/Button";
import { useClickOutside, useDropdownPosition } from "../../hooks";

export interface EditAmountProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fields: AmountField[]) => void;
  initialFields?: AmountField[];
}

export interface AmountField {
  id: string;
  type: "discount" | "simplified_tax" | "vat_tax";
  label: string;
  value: string;
}

const allFieldTypes = [
  { type: "discount", label: "Размер скидки, %" },
  { type: "simplified_tax", label: "Налог УСН, %" },
  { type: "vat_tax", label: "Налог НДС" },
];

const vatOptions = [
  { value: "0%", label: "0%" },
  { value: "10%", label: "10%" },
  { value: "20%", label: "20%" },
];

// VAT Dropdown Component
function VatDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useClickOutside<HTMLDivElement>({
    callback: () => setIsOpen(false),
    enabled: isOpen,
  });

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-9 border border-base-border rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-base-border bg-white text-left flex items-center justify-between"
      >
        <span
          className={
            value ? "text-base-foreground" : "text-base-muted-foreground"
          }
        >
          {value || "Выберите значение"}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="#71717A"
            strokeWidth="1.33"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-base-border rounded-md shadow-lg z-10"
          >
            {vatOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-base-border/50 first:rounded-t-md last:rounded-b-md"
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function EditAmount({
  isOpen,
  onClose,
  onSave,
  initialFields = [],
}: EditAmountProps) {
  const [fields, setFields] = useState<AmountField[]>(initialFields);
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  // Update fields when initialFields change
  useEffect(() => {
    setFields(initialFields);
  }, [initialFields]);

  // Ensure discount field is always present
  useEffect(() => {
    const hasDiscount = fields.some((field) => field.type === "discount");
    if (!hasDiscount) {
      const discountField: AmountField = {
        id: `discount-${Date.now()}`,
        type: "discount",
        label: "Размер скидки, %",
        value: "",
      };
      setFields((prev) => [discountField, ...prev]);
    }
  }, [fields]);
  const dropdownRef = useClickOutside<HTMLDivElement>({
    callback: () => onClose(),
    enabled: isOpen,
  });

  const { shouldOpenUp } = useDropdownPosition(isOpen, dropdownRef);

  // Check if a field type is already added
  const isFieldTypeAdded = (type: string) => {
    return fields.some((field) => field.type === type);
  };

  const handleAddField = (type: "discount" | "simplified_tax" | "vat_tax") => {
    // Don't add if field type is already added
    if (isFieldTypeAdded(type)) return;

    const fieldType = allFieldTypes.find((ft) => ft.type === type);
    if (!fieldType) return;

    const newField: AmountField = {
      id: `field-${Date.now()}`,
      type,
      label: fieldType.label,
      value: "",
    };

    setFields((prev) => [...prev, newField]);
    setShowAddDropdown(false);
  };

  const handleRemoveField = (fieldId: string) => {
    setFields((prev) => {
      const fieldToRemove = prev.find((field) => field.id === fieldId);
      // Don't allow removing the discount field
      if (fieldToRemove?.type === "discount") {
        return prev;
      }
      return prev.filter((field) => field.id !== fieldId);
    });
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFields((prev) =>
      prev.map((field) => (field.id === fieldId ? { ...field, value } : field))
    );
  };

  const handleSave = () => {
    onSave(fields);
    onClose();
  };

  const handleCancel = () => {
    setFields([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute w-80 h-fit right-0 bottom-0 z-50 mb-14.5 mr-4 bg-white border border-base-border rounded-md shadow-md p-4 min-w-[300px] ${
              shouldOpenUp ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Редактировать сумму</h3>
              <button
                onClick={onClose}
                className="hover:bg-base-border/50 rounded-md p-1 transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4L4 12M4 4L12 12"
                    stroke="#71717A"
                    strokeWidth="1.33"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div>
              <p className="text-sm text-base-muted-foreground mb-6">
                Добавьте скидку или налог для общей суммы
              </p>

              {/* Fields */}
              <div className="space-y-4 mb-3">
                {fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-sm/[1] font-normal text-base-foreground">
                      {field.label}
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        {field.type === "vat_tax" ? (
                          <VatDropdown
                            value={field.value}
                            onChange={(value) =>
                              handleFieldChange(field.id, value)
                            }
                          />
                        ) : (
                          <input
                            type="text"
                            value={field.value}
                            onChange={(e) =>
                              handleFieldChange(field.id, e.target.value)
                            }
                            className="w-full h-9 border border-base-border rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-base-border"
                          />
                        )}
                      </div>
                      {field.type !== "discount" && (
                        <Button
                          variant="outline"
                          onClick={() => handleRemoveField(field.id)}
                          className="size-9 text-red-500 hover:text-red-700 !p-0"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M2 4H14M12.6667 4V13.3333C12.6667 14 12 14.6667 11.3333 14.6667H4.66667C4 14.6667 3.33333 14 3.33333 13.3333V4M5.33333 4V2.66667C5.33333 2 6 1.33333 6.66667 1.33333H9.33333C10 1.33333 10.6667 2 10.6667 2.66667V4M6.66667 7.33333V11.3333M9.33333 7.33333V11.3333"
                              stroke="currentColor"
                              strokeWidth="1.33"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Field Dropdown */}
              <div className="relative mb-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddDropdown(!showAddDropdown)}
                  className="flex items-center justify-between h-9 border border-base-border rounded-md px-3 text-sm hover:bg-base-border/50 transition-colors"
                >
                  <span>Добавить</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`transition-transform ${
                      showAddDropdown ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      d="M4 6L8 10L12 6"
                      stroke="#71717A"
                      strokeWidth="1.33"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Button>

                <AnimatePresence>
                  {showAddDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-white border border-base-border rounded-md shadow-lg z-10"
                    >
                      {allFieldTypes.map((fieldType) => {
                        const isAdded = isFieldTypeAdded(fieldType.type);
                        const isDiscount = fieldType.type === "discount";
                        return (
                          <button
                            key={fieldType.type}
                            onClick={() =>
                              handleAddField(
                                fieldType.type as
                                  | "discount"
                                  | "simplified_tax"
                                  | "vat_tax"
                              )
                            }
                            disabled={isAdded || isDiscount}
                            className={`w-full text-left px-3 py-2 text-sm first:rounded-t-md last:rounded-b-md ${
                              isAdded || isDiscount
                                ? "text-base-muted-foreground cursor-not-allowed opacity-50"
                                : "hover:bg-base-border/50"
                            }`}
                          >
                            {fieldType.label}
                            {isAdded && " (уже добавлено)"}
                            {isDiscount && " (всегда видно)"}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="grid grid-cols-2 gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="text-sm px-3 py-1.5"
                >
                  Отмена
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  className="text-sm px-3 py-1.5"
                >
                  Сохранить
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
