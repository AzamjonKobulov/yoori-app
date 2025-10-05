import { motion, AnimatePresence } from "framer-motion";

interface VariantsDropdownProps {
  isVisible: boolean;
  variants: Array<{
    id: string;
    name: string;
  }>;
  onVariantClick: (variantId: string) => void;
}

export default function VariantsDropdown({
  isVisible,
  variants,
  onVariantClick,
}: VariantsDropdownProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute top-0 z-[70] min-w-55 max-w-max bg-white text-sm/5 border border-base-border rounded-md shadow-lg p-1"
          style={{ left: "calc(100% + 12px)" }}
          initial={{ opacity: 0, x: -10, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="font-semibold pt-1.5 pb-2.5 px-2 text-gray-700">
            Варианты КП
          </div>
          <ul className="pt-1">
            {variants.map((variant) => (
              <li
                key={variant.id}
                className="w-full flex-between hover:bg-base-chart-1/[4%] rounded-[2px] cursor-pointer py-1.5 px-2 transition-colors duration-150"
                onClick={() => onVariantClick(variant.id)}
              >
                <span className="line-clamp-1">{variant.name}</span>
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
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
