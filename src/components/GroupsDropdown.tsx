import { motion, AnimatePresence } from "framer-motion";
import Button from "./ui/Button";

interface GroupsDropdownProps {
  isVisible: boolean;
  groups: Array<{
    id: string;
    name: string;
  }>;
  onGroupClick: (groupId: string) => void;
  onCopyAllClick: () => void;
}

export default function GroupsDropdown({
  isVisible,
  groups,
  onGroupClick,
  onCopyAllClick,
}: GroupsDropdownProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute top-0 z-[80] min-w-55 max-w-max bg-white text-sm/5 border border-base-border rounded-md shadow-lg p-1"
          style={{ left: "calc(100% + 12px)" }}
          initial={{ opacity: 0, x: -10, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="font-semibold pt-1.5 pb-2.5 px-2 text-gray-700">
            Группы товаров
          </div>
          <ul className="py-1">
            {groups.length === 0 ? (
              <li className="w-full py-1.5 px-2 text-gray-500 text-sm">
                Нет групп
              </li>
            ) : (
              groups.map((group) => (
                <motion.li
                  key={group.id}
                  className="w-full hover:bg-base-chart-1/[4%] rounded-[2px] cursor-pointer py-1.5 px-2 transition-colors duration-150"
                  onClick={() => onGroupClick(group.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="line-clamp-1">{group.name}</span>
                </motion.li>
              ))
            )}
          </ul>
          {groups.length > 0 && (
            <Button
              variant="ghost"
              className="mt-1 w-full text-xs"
              onClick={onCopyAllClick}
            >
              Скопировать все группы
            </Button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
