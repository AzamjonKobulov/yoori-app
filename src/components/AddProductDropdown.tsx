import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useClickOutside, useDropdownPosition } from "../hooks";
import Button from "./ui/Button";

interface AddProductDropdownProps {
  onAddFromList: () => void;
  onQuickAdd: () => void;
  onCopyFromGroup?: (sourceVariantId: string, sourceGroupId: string) => void;
  onCopyAllGroupsFromVariant?: (sourceVariantId: string) => void;
  variants?: unknown[];
  showCopyFrom?: boolean;
}

export default function AddProductDropdown({
  onAddFromList,
  onQuickAdd,
  showCopyFrom = true,
  ...rest
}: AddProductDropdownProps) {
  // Destructure unused props to avoid linting errors
  const { onCopyFromGroup, onCopyAllGroupsFromVariant, variants } = rest;

  // Suppress unused variable warnings
  void onCopyFromGroup;
  void onCopyAllGroupsFromVariant;
  void variants;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const clickOutsideRef = useClickOutside<HTMLDivElement>({
    callback: () => {
      setIsDropdownOpen(false);
    },
    enabled: isDropdownOpen,
  });

  const { shouldOpenUp } = useDropdownPosition(isDropdownOpen, clickOutsideRef);

  return (
    <div className="relative z-[70] w-full" ref={clickOutsideRef}>
      <Button
        variant="ghost"
        className="flex items-center gap-2 mt-2"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        Добавить товар
        <motion.svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          animate={{ rotate: isDropdownOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="#8942FE"
            strokeWidth="1.33"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </Button>
      <div className="border-b border-base-border mt-2"></div>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            className={`min-w-55 max-w-max absolute top-0 left-0 z-[60] bg-white text-sm/5 border border-base-border rounded-md shadow-md p-1 ${
              shouldOpenUp ? "bottom-full mb-2" : "top-full mt-1"
            }`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <ul>
              <li
                className="w-full hover:bg-base-chart-1/[4%] rounded-[2px] cursor-pointer py-1.5 px-2"
                onClick={onAddFromList}
              >
                Добавить из списка товаров
              </li>
              <li
                className="w-full hover:bg-base-chart-1/[4%] rounded-[2px] cursor-pointer py-1.5 px-2"
                onClick={onQuickAdd}
              >
                Быстрое добавление
              </li>
              {showCopyFrom && (
                <li className="w-full flex-between hover:bg-base-chart-1/[4%] rounded-[2px] cursor-pointer py-1.5 px-2">
                  Копировать из
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 12L10 8L6 4"
                      stroke="#09090B"
                      strokeWidth="1.33"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
