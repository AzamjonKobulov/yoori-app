import Button from "./ui/Button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import AddProduct from "./modals/AddProduct";
import AddProductDropdown from "./AddProductDropdown";
import TableActions from "./ui/TableActions.tsx";
// import { apiCP } from "../http/apis";

interface ProductGroupProps {
  groupId: string;
  groupName: string;
  products: Array<{
    id: string;
    name: string;
    amount: string;
    cost: string;
    costAmount: string;
  }>;
  onAddProducts: (
    groupId: string,
    products: Array<{
      id: string;
      name: string;
      price: string;
      sku: string;
      description: string;
      image: string;
    }>
  ) => void;
  onQuickAdd: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onEditGroup: (groupId: string) => void;
  onEditProductField: (
    groupId: string,
    productId: string,
    field: "name" | "amount" | "cost",
    newValue: string
  ) => void;
  tableHeaders?: {
    name: string;
    amount: string;
    cost: string;
    costAmount: string;
  };
  onDeleteProduct: (groupId: string, productId: string) => void;
  onSaveGroupName: (groupId: string, newName: string) => void;
  onCancelGroupEdit: () => void;
  isEditing: boolean;
  editingName: string;
  initiallyExpanded?: boolean;
  onReorderProducts?: (
    groupId: string,
    newOrder: Array<{
      id: string;
      name: string;
      amount: string;
      cost: string;
      costAmount: string;
    }>
  ) => void;
  onCopyFromGroup?: (sourceVariantId: string, sourceGroupId: string) => void;
  onCopyAllGroupsFromVariant?: (sourceVariantId: string) => void;
  variants?: Array<{
    id: string;
    name: string;
    productGroups: Array<{
      id: string;
      name: string;
    }>;
  }>;
}

export default function ProductGroup({
  groupId,
  groupName,
  products,
  onAddProducts,
  onQuickAdd,
  onDeleteGroup,
  onEditGroup,
  onEditProductField,
  tableHeaders = {
    name: "Название",
    amount: "Кол-во, шт",
    cost: "Цена, ₽",
    costAmount: "Стоимость, ₽",
  },
  onDeleteProduct,
  onSaveGroupName,
  onCancelGroupEdit,
  isEditing,
  editingName,
  initiallyExpanded = true,
  onReorderProducts,
  onCopyFromGroup,
  onCopyAllGroupsFromVariant,
  variants = [],
}: ProductGroupProps) {
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const [localEditingName, setLocalEditingName] = useState<string>("");
  const [columnOrder, setColumnOrder] = useState<string[]>([
    "name",
    "amount",
    "cost",
    "costAmount",
  ]);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [draggedRow, setDraggedRow] = useState<string | null>(null);
  const [editingHeader, setEditingHeader] = useState<string | null>(null);
  const [editingHeaderValue, setEditingHeaderValue] = useState<string>("");
  const [editingDataCell, setEditingDataCell] = useState<{
    rowId: string;
    field: string;
  } | null>(null);
  const [editingDataValue, setEditingDataValue] = useState<string>("");
  const [additionalColumns, setAdditionalColumns] = useState<
    Array<{
      id: string;
      label: string;
      type: string;
    }>
  >([]);
  const [additionalColumnData, setAdditionalColumnData] = useState<
    Record<string, Record<string, string>>
  >({});

  // Sync local editing name with prop when editing starts
  useEffect(() => {
    if (isEditing) {
      setLocalEditingName(editingName);
    }
  }, [isEditing, editingName]);

  const handleSelectAll = () => {
    setSelectedRows((prev) =>
      prev.size === products.length
        ? new Set()
        : new Set(products.map((r) => r.id))
    );
  };

  const handleRowSelect = (rowId: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  };

  const handleOpenAddProduct = () => {
    setShowAddProductModal(true);
  };

  const handleAddProducts = (
    groupId: string,
    selectedProducts: Array<{
      id: string;
      name: string;
      price: string;
      sku: string;
      description: string;
      image: string;
    }>
  ) => {
    onAddProducts(groupId, selectedProducts);
    setShowAddProductModal(false);
  };

  const handleQuickAdd = () => {
    onQuickAdd(groupId);
  };

  const handleDeleteItem = (itemId: string) => {
    // Call the parent's update function to remove the product from the group
    onDeleteProduct(groupId, itemId);
  };

  // Group name editing handlers
  const handleStartGroupEdit = () => {
    onEditGroup(groupId);
  };

  const handleSaveGroupEdit = () => {
    if (localEditingName.trim()) {
      onSaveGroupName(groupId, localEditingName);
    }
  };

  const handleCancelGroupEdit = () => {
    setLocalEditingName("");
    onCancelGroupEdit();
  };

  const handleAddField = (fieldType: string) => {
    // Map field types to labels
    const fieldTypeMap: { [key: string]: string } = {
      "discount-amount": "Скидка (сумма)",
      "discount-percent": "Скидка (%)",
      "tax-percent": "Налог (%)",
      "markup-percent": "Наценка (%)",
      "markup-amount": "Наценка(сумма)",
      quantity: "Кол-во",
      "number-multiply-price": "Число (умножение на цену)",
      "number-multiply-fields": "Число (умножений полей)",
      text: "Текст",
      price: "Цена",
      article: "Артикул",
    };

    const label = fieldTypeMap[fieldType] || fieldType;

    // Check if column already exists
    const columnExists = additionalColumns.some(
      (col) => col.type === fieldType
    );
    if (columnExists) {
      console.log("Column already exists:", fieldType);
      return;
    }

    // Add new column
    const newColumn = {
      id: `col-${Date.now()}`,
      label,
      type: fieldType,
    };

    setAdditionalColumns((prev) => [...prev, newColumn]);
    // Add the new column to the column order
    setColumnOrder((prev) => [...prev, newColumn.id]);
    console.log("Added column:", newColumn);
  };

  // Header editing handlers
  const handleEditHeader = (headerId: string, currentValue: string) => {
    setEditingHeader(headerId);
    setEditingHeaderValue(currentValue);
  };

  const handleSaveHeader = () => {
    if (editingHeader && editingHeaderValue.trim()) {
      // TODO: Implement header save logic
      console.log("Saving header:", editingHeader, editingHeaderValue);
    }
    setEditingHeader(null);
    setEditingHeaderValue("");
  };

  const handleCancelHeader = () => {
    setEditingHeader(null);
    setEditingHeaderValue("");
  };

  // Data cell editing handlers
  const handleEditDataCell = (
    rowId: string,
    field: string,
    currentValue: string
  ) => {
    setEditingDataCell({ rowId, field });
    setEditingDataValue(currentValue);
  };

  const handleSaveDataCell = () => {
    if (editingDataCell && editingDataValue.trim()) {
      const isOriginalField = ["name", "amount", "cost"].includes(
        editingDataCell.field
      );

      if (isOriginalField) {
        // Save the data cell using the existing onEditProductField prop
        onEditProductField(
          groupId,
          editingDataCell.rowId,
          editingDataCell.field as "name" | "amount" | "cost",
          editingDataValue
        );
      } else {
        // Handle additional column data
        setAdditionalColumnData((prev) => ({
          ...prev,
          [editingDataCell.rowId]: {
            ...prev[editingDataCell.rowId],
            [editingDataCell.field]: editingDataValue,
          },
        }));
      }
    }
    setEditingDataCell(null);
    setEditingDataValue("");
  };

  const handleCancelDataCell = () => {
    setEditingDataCell(null);
    setEditingDataValue("");
  };

  const handleGroupNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveGroupEdit();
    } else if (e.key === "Escape") {
      handleCancelGroupEdit();
    }
  };

  const calculateTotalCost = () => {
    const total = products.reduce((total, product) => {
      // Calculate cost amount from amount and cost, removing any formatting
      const amount =
        parseFloat((product.amount || "0").replace(/\s/g, "")) || 0;
      const cost = parseFloat((product.cost || "0").replace(/\s/g, "")) || 0;
      return total + amount * cost;
    }, 0);

    return total;
  };

  // Column drag and drop handlers
  const handleColumnDragStart = (e: React.DragEvent, columnId: string) => {
    if (columnId === "name") return; // Don't allow dragging name column
    setDraggedColumn(columnId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleColumnDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (
      !draggedColumn ||
      draggedColumn === targetColumnId ||
      targetColumnId === "name"
    )
      return;

    const newOrder = [...columnOrder];
    const draggedIndex = newOrder.indexOf(draggedColumn);
    const targetIndex = newOrder.indexOf(targetColumnId);

    // Remove dragged column and insert at target position
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedColumn);

    setColumnOrder(newOrder);
    setDraggedColumn(null);
  };

  // Row drag and drop handlers
  const handleRowDragStart = (e: React.DragEvent, rowId: string) => {
    setDraggedRow(rowId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleRowDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleRowDrop = (e: React.DragEvent, targetRowId: string) => {
    e.preventDefault();
    if (!draggedRow || draggedRow === targetRowId || !onReorderProducts) return;

    const newProducts = [...products];
    const draggedIndex = newProducts.findIndex((row) => row.id === draggedRow);
    const targetIndex = newProducts.findIndex((row) => row.id === targetRowId);

    // Remove dragged row and insert at target position
    const [draggedRowData] = newProducts.splice(draggedIndex, 1);
    newProducts.splice(targetIndex, 0, draggedRowData);

    // Call the parent's reorder function
    onReorderProducts(groupId, newProducts);
    setDraggedRow(null);
  };

  return (
    <div className="mt-8">
      <div className="flex-between mb-4">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <motion.svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              animate={{ rotate: isExpanded ? 0 : -90 }}
              transition={{ duration: 0.2 }}
            >
              <path
                d="M18.002 15L12.002 9L6.00195 15"
                stroke="#71717A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
            <input
              type="text"
              value={localEditingName}
              onChange={(e) => setLocalEditingName(e.target.value)}
              onKeyDown={handleGroupNameKeyPress}
              onBlur={handleSaveGroupEdit}
              className="text-lg font-medium bg-transparent border-b border-base-border focus:border-base-chart-1 focus:outline-none px-1 py-0.5 min-w-0 flex-1"
              autoFocus
            />
            <span className="text-base-muted-foreground">
              · {calculateTotalCost().toLocaleString("ru-RU")} ₽
            </span>
          </div>
        ) : (
          <button
            className="flex items-center gap-2"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <motion.svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              animate={{ rotate: isExpanded ? 0 : -90 }}
              transition={{ duration: 0.2 }}
            >
              <path
                d="M18.002 15L12.002 9L6.00195 15"
                stroke="#71717A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
            {groupName}{" "}
            <span className="text-base-muted-foreground">
              · {calculateTotalCost().toLocaleString("ru-RU")} ₽
            </span>
          </button>
        )}

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="!size-8 shrink-0 flex-center !p-0"
            onClick={handleStartGroupEdit}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_1875_19777)">
                <path
                  d="M10.0026 3.33333L12.6693 6M14.1186 4.54126C14.471 4.18888 14.6691 3.71091 14.6691 3.2125C14.6692 2.71409 14.4713 2.23607 14.1189 1.8836C13.7665 1.53112 13.2885 1.33307 12.7901 1.33301C12.2917 1.33295 11.8137 1.53088 11.4612 1.88326L2.56389 10.7826C2.40911 10.9369 2.29464 11.127 2.23056 11.3359L1.34989 14.2373C1.33266 14.2949 1.33136 14.3562 1.34613 14.4145C1.36089 14.4728 1.39117 14.5261 1.43376 14.5686C1.47634 14.6111 1.52964 14.6413 1.588 14.656C1.64636 14.6707 1.7076 14.6693 1.76523 14.6519L4.66723 13.7719C4.87601 13.7084 5.06601 13.5947 5.22056 13.4406L14.1186 4.54126Z"
                  stroke="#18181B"
                  stroke-width="1.33"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_1875_19777">
                  <rect
                    width="16"
                    height="16"
                    fill="white"
                    transform="translate(0.00195312)"
                  />
                </clipPath>
              </defs>
            </svg>
          </Button>

          <Button
            variant="outline"
            className="!size-8 shrink-0 flex-center !p-0"
            onClick={() => onDeleteGroup(groupId)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.00195 4.00004H14.002M12.6686 4.00004V13.3334C12.6686 14 12.002 14.6667 11.3353 14.6667H4.66862C4.00195 14.6667 3.33529 14 3.33529 13.3334V4.00004M5.33529 4.00004V2.66671C5.33529 2.00004 6.00195 1.33337 6.66862 1.33337H9.33529C10.002 1.33337 10.6686 2.00004 10.6686 2.66671V4.00004M6.66862 7.33337V11.3334M9.33529 7.33337V11.3334"
                stroke="#DC2626"
                stroke-width="1.33"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </Button>
        </div>
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className={`overflow-y-auto overflow-x-auto ${
            isExpanded && products.length > 10 ? "max-h-[600px]" : ""
          }`}
        >
          <table className="table table-auto min-w-full text-sm/5 text-left border-y border-base-border">
            <thead className="text-base-muted-foreground sticky -top-px bg-white z-10">
              <tr className="h-10 bg-base-blue-100 border-b border-base-border divide-x divide-base-border">
                {columnOrder.map((columnId) => {
                  // Check if this is an original column or additional column
                  const isOriginalColumn = [
                    "name",
                    "amount",
                    "cost",
                    "costAmount",
                  ].includes(columnId);
                  const additionalColumn = additionalColumns.find(
                    (col) => col.id === columnId
                  );

                  const isNameColumn = columnId === "name";
                  const columnWidth = isNameColumn
                    ? "min-w-100 max-w-max"
                    : "min-w-40 max-w-max";

                  return (
                    <th
                      key={columnId}
                      className={`${columnWidth} group font-medium px-3.5 whitespace-nowrap ${
                        !isNameColumn ? "cursor-move" : ""
                      }`}
                      draggable={!isNameColumn}
                      onDragStart={(e) => handleColumnDragStart(e, columnId)}
                      onDragOver={handleColumnDragOver}
                      onDrop={(e) => handleColumnDrop(e, columnId)}
                      style={{
                        opacity: draggedColumn === columnId ? 0.5 : 1,
                        backgroundColor:
                          draggedColumn === columnId ? "#f3f4f6" : undefined,
                      }}
                    >
                      {isNameColumn ? (
                        <div className="flex items-center gap-5.5 pl-2 py-2.5">
                          <div className="pl-4.5">
                            <input
                              type="checkbox"
                              id={`check-all-${groupId}`}
                              className="peer hidden"
                              checked={
                                selectedRows.size === products.length &&
                                products.length > 0
                              }
                              onChange={handleSelectAll}
                            />
                            <label
                              htmlFor={`check-all-${groupId}`}
                              className="size-4 flex-center border border-base-foreground rounded-[2px] peer-checked:bg-base-chart-1 peer-checked:border-base-chart-1 shadow-primary"
                            >
                              <svg
                                width="12"
                                height="9"
                                viewBox="0 0 12 9"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M11.3346 1L4.0013 8.33333L0.667969 5"
                                  stroke="#FAFAFA"
                                  stroke-width="1.33"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                              </svg>
                            </label>
                          </div>
                          {tableHeaders.name}
                        </div>
                      ) : isOriginalColumn ? (
                        <div className="flex-between py-2.5 group">
                          {editingHeader === columnId ? (
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="text"
                                value={editingHeaderValue}
                                onChange={(e) =>
                                  setEditingHeaderValue(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveHeader();
                                  if (e.key === "Escape") handleCancelHeader();
                                }}
                                className="flex-1 border border-base-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-base-border bg-white"
                                autoFocus
                              />
                              <Button
                                variant="outline"
                                className="!size-6 shrink-0 shadow-sm !p-0 !bg-base-chart-1 border-base-chart-1 hover:bg-base-chart-1/90"
                                onClick={handleSaveHeader}
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M13.3346 4L6.0013 11.3333L2.66797 8"
                                    stroke="white"
                                    strokeWidth="1.33"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </Button>
                              <Button
                                variant="outline"
                                className="!size-6 shrink-0 shadow-sm !p-0"
                                onClick={handleCancelHeader}
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M12.002 4L4.00195 12M4.00195 4L12.002 12"
                                    stroke="#18181B"
                                    strokeWidth="1.33"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </Button>
                            </div>
                          ) : (
                            <>
                              <span
                                className="cursor-pointer"
                                onDoubleClick={() =>
                                  handleEditHeader(
                                    columnId,
                                    tableHeaders[
                                      columnId as keyof typeof tableHeaders
                                    ]
                                  )
                                }
                              >
                                {
                                  tableHeaders[
                                    columnId as keyof typeof tableHeaders
                                  ]
                                }
                              </span>
                              <div className="flex items-center min-w-fit max-w-max gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Button
                                  variant="outline"
                                  className="!size-6 shrink-0 shadow-sm !p-0"
                                  onClick={() =>
                                    handleEditHeader(
                                      columnId,
                                      tableHeaders[
                                        columnId as keyof typeof tableHeaders
                                      ]
                                    )
                                  }
                                >
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                  >
                                    <path
                                      d="M10.0026 3.33333L12.6693 6M14.1186 4.54126C14.471 4.18888 14.6691 3.71091 14.6691 3.2125C14.6692 2.71409 14.4713 2.23607 14.1189 1.8836C13.7665 1.53112 13.2885 1.33307 12.7901 1.33301C12.2917 1.33295 11.8137 1.53088 11.4612 1.88326L2.56389 10.7826C2.40911 10.9369 2.29464 11.127 2.23056 11.3359L1.34989 14.2373C1.33266 14.2949 1.33136 14.3562 1.34613 14.4145C1.36089 14.4728 1.39117 14.5261 1.43376 14.5686C1.47634 14.6111 1.52964 14.6413 1.588 14.656C1.64636 14.6707 1.7076 14.6693 1.76523 14.6519L4.66723 13.7719C4.87601 13.7084 5.06601 13.5947 5.22056 13.4406L14.1186 4.54126Z"
                                      stroke="#18181B"
                                      strokeWidth="1.33"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </Button>
                                <img
                                  src="/assets/images/dnd-icon.svg"
                                  alt="dnd-icon"
                                  className="opacity-100"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="flex-between py-2.5 group">
                          {editingHeader === columnId ? (
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="text"
                                value={editingHeaderValue}
                                onChange={(e) =>
                                  setEditingHeaderValue(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveHeader();
                                  if (e.key === "Escape") handleCancelHeader();
                                }}
                                className="flex-1 border border-base-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-base-border bg-white"
                                autoFocus
                              />
                              <Button
                                variant="outline"
                                className="!size-6 shrink-0 shadow-sm !p-0 !bg-base-chart-1 border-base-chart-1 hover:bg-base-chart-1/90"
                                onClick={handleSaveHeader}
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M13.3346 4L6.0013 11.3333L2.66797 8"
                                    stroke="white"
                                    strokeWidth="1.33"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </Button>
                              <Button
                                variant="outline"
                                className="!size-6 shrink-0 shadow-sm !p-0"
                                onClick={handleCancelHeader}
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M12.002 4L4.00195 12M4.00195 4L12.002 12"
                                    stroke="#18181B"
                                    strokeWidth="1.33"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </Button>
                            </div>
                          ) : (
                            <>
                              <span
                                className="cursor-pointer"
                                onDoubleClick={() =>
                                  handleEditHeader(
                                    columnId,
                                    additionalColumn?.label || ""
                                  )
                                }
                              >
                                {additionalColumn?.label || ""}
                              </span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Button
                                  variant="outline"
                                  className="!size-6 shrink-0 shadow-sm !p-0"
                                  onClick={() =>
                                    handleEditHeader(
                                      columnId,
                                      additionalColumn?.label || ""
                                    )
                                  }
                                >
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                  >
                                    <path
                                      d="M10.0026 3.33333L12.6693 6M14.1186 4.54126C14.471 4.18888 14.6691 3.71091 14.6691 3.2125C14.6692 2.71409 14.4713 2.23607 14.1189 1.8836C13.7665 1.53112 13.2885 1.33307 12.7901 1.33301C12.2917 1.33295 11.8137 1.53088 11.4612 1.88326L2.56389 10.7826C2.40911 10.9369 2.29464 11.127 2.23056 11.3359L1.34989 14.2373C1.33266 14.2949 1.33136 14.3562 1.34613 14.4145C1.36089 14.4728 1.39117 14.5261 1.43376 14.5686C1.47634 14.6111 1.52964 14.6413 1.588 14.656C1.64636 14.6707 1.7076 14.6693 1.76523 14.6519L4.66723 13.7719C4.87601 13.7084 5.06601 13.5947 5.22056 13.4406L14.1186 4.54126Z"
                                      stroke="#18181B"
                                      strokeWidth="1.33"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </Button>
                                <img
                                  src="/assets/images/dnd-icon.svg"
                                  alt="dnd-icon"
                                  className="opacity-100"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </th>
                  );
                })}
                <th className="min-w-40 max-w-max font-medium px-3.5 whitespace-nowrap">
                  {/* Add column button */}
                  <TableActions
                    trigger={
                      <button className="h-full flex-center">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3.33594 8.00004H12.6693M8.0026 3.33337V12.6667"
                            stroke="#71717A"
                            stroke-width="1.33"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </button>
                    }
                    onAddField={handleAddField}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-base-border divide-x divide-base-border cursor-move"
                  draggable
                  onDragStart={(e) => handleRowDragStart(e, item.id)}
                  onDragOver={handleRowDragOver}
                  onDrop={(e) => handleRowDrop(e, item.id)}
                  style={{
                    opacity: draggedRow === item.id ? 0.5 : 1,
                    backgroundColor:
                      draggedRow === item.id ? "#f3f4f6" : undefined,
                  }}
                >
                  {columnOrder.map((columnId) => {
                    // Check if this is an original column or additional column
                    const isOriginalColumn = [
                      "name",
                      "amount",
                      "cost",
                      "costAmount",
                    ].includes(columnId);
                    const additionalColumn = additionalColumns.find(
                      (col) => col.id === columnId
                    );

                    const isNameColumn = columnId === "name";
                    const columnWidth = isNameColumn
                      ? "min-w-100 max-w-max"
                      : "min-w-40 max-w-max";

                    if (isNameColumn) {
                      return (
                        <td
                          key={columnId}
                          className="flex items-center gap-4 font-medium py-2 pl-2 group hover:bg-base-chart-1/[4%] transition-colors duration-200 relative"
                        >
                          {/* Row Drag/Drop Button */}
                          <button className="h-full">
                            <img
                              src="/assets/images/dnd-icon.svg"
                              alt="dnd-icon"
                            />
                          </button>
                          <div>
                            <input
                              type="checkbox"
                              id={`check-${item.id}`}
                              className="peer hidden"
                              checked={selectedRows.has(item.id)}
                              onChange={() => handleRowSelect(item.id)}
                            />
                            <label
                              htmlFor={`check-${item.id}`}
                              className="size-4 flex-center border border-base-foreground rounded-[2px] peer-checked:bg-base-chart-1 peer-checked:border-base-chart-1 shadow-primary"
                            >
                              <svg
                                width="12"
                                height="9"
                                viewBox="0 0 12 9"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M11.3346 1L4.0013 8.33333L0.667969 5"
                                  stroke="#FAFAFA"
                                  stroke-width="1.33"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                              </svg>
                            </label>
                          </div>
                          <div className="pl-1.5 relative h-8 flex items-center">
                            {editingDataCell?.rowId === item.id &&
                            editingDataCell?.field === "name" ? (
                              <div className="absolute inset-0 bg-white flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editingDataValue}
                                  onChange={(e) =>
                                    setEditingDataValue(e.target.value)
                                  }
                                  className="border border-base-border rounded px-3 py-1.5 text-sm/5 focus:outline-none focus:ring-2 focus:ring-base-border bg-white"
                                  style={{
                                    width: `${Math.max(
                                      editingDataValue.length * 8 + 40,
                                      120
                                    )}px`,
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleSaveDataCell();
                                    } else if (e.key === "Escape") {
                                      handleCancelDataCell();
                                    }
                                  }}
                                  autoFocus
                                />
                                {/* Save Button */}
                                <Button
                                  variant="outline"
                                  className="!size-8 shrink-0 shadow-sm !p-0 !bg-base-chart-1 border-base-chart-1 hover:bg-base-chart-1/90"
                                  onClick={handleSaveDataCell}
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M13.3346 4L6.0013 11.3333L2.66797 8"
                                      stroke="white"
                                      strokeWidth="1.33"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </Button>
                                {/* Cancel Button */}
                                <Button
                                  variant="outline"
                                  className="!size-8 shrink-0 shadow-sm !p-0"
                                  onClick={handleCancelDataCell}
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M12.002 4L4.00195 12M4.00195 4L12.002 12"
                                      stroke="#18181B"
                                      strokeWidth="1.33"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </Button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-1 group">
                                  <span
                                    className="cursor-pointer hover:bg-base-muted px-2 py-1 rounded transition-colors"
                                    onDoubleClick={() =>
                                      handleEditDataCell(
                                        item.id,
                                        "name",
                                        item.name
                                      )
                                    }
                                  >
                                    {item.name}
                                  </span>
                                  <Button
                                    variant="outline"
                                    className="!size-6 shrink-0 shadow-sm !p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    onClick={() =>
                                      handleEditDataCell(
                                        item.id,
                                        "name",
                                        item.name
                                      )
                                    }
                                  >
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 16 16"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <g clipPath="url(#clip0_1875_19777)">
                                        <path
                                          d="M10.0026 3.33333L12.6693 6M14.1186 4.54126C14.471 4.18888 14.6691 3.71091 14.6691 3.2125C14.6692 2.71409 14.4713 2.23607 14.1189 1.8836C13.7665 1.53112 13.2885 1.33307 12.7901 1.33301C12.2917 1.33295 11.8137 1.53088 11.4612 1.88326L2.56389 10.7826C2.40911 10.9369 2.29464 11.127 2.23056 11.3359L1.34989 14.2373C1.33266 14.2949 1.33136 14.3562 1.34613 14.4145C1.36089 14.4728 1.39117 14.5261 1.43376 14.5686C1.47634 14.6111 1.52964 14.6413 1.588 14.656C1.64636 14.6707 1.7076 14.6693 1.76523 14.6519L4.66723 13.7719C4.87601 13.7084 5.06601 13.5947 5.22056 13.4406L14.1186 4.54126Z"
                                          stroke="#18181B"
                                          strokeWidth="1.33"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </g>
                                      <defs>
                                        <clipPath id="clip0_1875_19777">
                                          <rect
                                            width="16"
                                            height="16"
                                            fill="white"
                                            transform="translate(0.00195312)"
                                          />
                                        </clipPath>
                                      </defs>
                                    </svg>
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      );
                    } else if (isOriginalColumn) {
                      // Render other original columns (amount, cost, costAmount)
                      return (
                        <td
                          key={columnId}
                          className={`${columnWidth} px-3.5 ${
                            columnId === "costAmount" ? "text-end" : ""
                          }`}
                        >
                          {columnId === "amount" && (
                            <>
                              {editingDataCell?.rowId === item.id &&
                              editingDataCell?.field === "amount" ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={editingDataValue}
                                    onChange={(e) =>
                                      setEditingDataValue(e.target.value)
                                    }
                                    className="w-full border border-base-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-base-border bg-white"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        handleSaveDataCell();
                                      } else if (e.key === "Escape") {
                                        handleCancelDataCell();
                                      }
                                    }}
                                    autoFocus
                                  />
                                  <Button
                                    variant="outline"
                                    className="!size-6 shrink-0 shadow-sm !p-0 !bg-base-chart-1 border-base-chart-1 hover:bg-base-chart-1/90"
                                    onClick={handleSaveDataCell}
                                  >
                                    <svg
                                      width="12"
                                      height="12"
                                      viewBox="0 0 16 16"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M13.3346 4L6.0013 11.3333L2.66797 8"
                                        stroke="white"
                                        strokeWidth="1.33"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="!size-6 shrink-0 shadow-sm !p-0"
                                    onClick={handleCancelDataCell}
                                  >
                                    <svg
                                      width="12"
                                      height="12"
                                      viewBox="0 0 16 16"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M12.002 4L4.00195 12M4.00195 4L12.002 12"
                                        stroke="#18181B"
                                        strokeWidth="1.33"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 group">
                                  <span
                                    className="cursor-pointer hover:bg-base-muted px-2 py-1 rounded transition-colors"
                                    onDoubleClick={() =>
                                      handleEditDataCell(
                                        item.id,
                                        "amount",
                                        item.amount
                                      )
                                    }
                                  >
                                    {item.amount}
                                  </span>
                                  <Button
                                    variant="outline"
                                    className="!size-6 shrink-0 shadow-sm !p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    onClick={() =>
                                      handleEditDataCell(
                                        item.id,
                                        "amount",
                                        item.amount
                                      )
                                    }
                                  >
                                    <svg
                                      width="12"
                                      height="12"
                                      viewBox="0 0 16 16"
                                      fill="none"
                                    >
                                      <path
                                        d="M10.0026 3.33333L12.6693 6M14.1186 4.54126C14.471 4.18888 14.6691 3.71091 14.6691 3.2125C14.6692 2.71409 14.4713 2.23607 14.1189 1.8836C13.7665 1.53112 13.2885 1.33307 12.7901 1.33301C12.2917 1.33295 11.8137 1.53088 11.4612 1.88326L2.56389 10.7826C2.40911 10.9369 2.29464 11.127 2.23056 11.3359L1.34989 14.2373C1.33266 14.2949 1.33136 14.3562 1.34613 14.4145C1.36089 14.4728 1.39117 14.5261 1.43376 14.5686C1.47634 14.6111 1.52964 14.6413 1.588 14.656C1.64636 14.6707 1.7076 14.6693 1.76523 14.6519L4.66723 13.7719C4.87601 13.7084 5.06601 13.5947 5.22056 13.4406L14.1186 4.54126Z"
                                        stroke="#18181B"
                                        strokeWidth="1.33"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </Button>
                                </div>
                              )}
                            </>
                          )}

                          {columnId === "cost" && (
                            <>
                              {editingDataCell?.rowId === item.id &&
                              editingDataCell?.field === "cost" ? (
                                <div className="flex items-center gap-2 justify-end">
                                  <input
                                    type="text"
                                    value={editingDataValue}
                                    onChange={(e) =>
                                      setEditingDataValue(e.target.value)
                                    }
                                    className="w-full border border-base-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-base-border bg-white text-right"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        handleSaveDataCell();
                                      } else if (e.key === "Escape") {
                                        handleCancelDataCell();
                                      }
                                    }}
                                    autoFocus
                                  />
                                  <Button
                                    variant="outline"
                                    className="!size-6 shrink-0 shadow-sm !p-0 !bg-base-chart-1 border-base-chart-1 hover:bg-base-chart-1/90"
                                    onClick={handleSaveDataCell}
                                  >
                                    <svg
                                      width="12"
                                      height="12"
                                      viewBox="0 0 16 16"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M13.3346 4L6.0013 11.3333L2.66797 8"
                                        stroke="white"
                                        strokeWidth="1.33"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="!size-6 shrink-0 shadow-sm !p-0"
                                    onClick={handleCancelDataCell}
                                  >
                                    <svg
                                      width="12"
                                      height="12"
                                      viewBox="0 0 16 16"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M12.002 4L4.00195 12M4.00195 4L12.002 12"
                                        stroke="#18181B"
                                        strokeWidth="1.33"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 group">
                                  <span
                                    className="cursor-pointer hover:bg-base-muted px-2 py-1 rounded transition-colors"
                                    onDoubleClick={() =>
                                      handleEditDataCell(
                                        item.id,
                                        "cost",
                                        item.cost
                                      )
                                    }
                                  >
                                    {item.cost.replace(/\s/g, "")}
                                  </span>
                                  <Button
                                    variant="outline"
                                    className="!size-6 shrink-0 shadow-sm !p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    onClick={() =>
                                      handleEditDataCell(
                                        item.id,
                                        "cost",
                                        item.cost
                                      )
                                    }
                                  >
                                    <svg
                                      width="12"
                                      height="12"
                                      viewBox="0 0 16 16"
                                      fill="none"
                                    >
                                      <path
                                        d="M10.0026 3.33333L12.6693 6M14.1186 4.54126C14.471 4.18888 14.6691 3.71091 14.6691 3.2125C14.6692 2.71409 14.4713 2.23607 14.1189 1.8836C13.7665 1.53112 13.2885 1.33307 12.7901 1.33301C12.2917 1.33295 11.8137 1.53088 11.4612 1.88326L2.56389 10.7826C2.40911 10.9369 2.29464 11.127 2.23056 11.3359L1.34989 14.2373C1.33266 14.2949 1.33136 14.3562 1.34613 14.4145C1.36089 14.4728 1.39117 14.5261 1.43376 14.5686C1.47634 14.6111 1.52964 14.6413 1.588 14.656C1.64636 14.6707 1.7076 14.6693 1.76523 14.6519L4.66723 13.7719C4.87601 13.7084 5.06601 13.5947 5.22056 13.4406L14.1186 4.54126Z"
                                        stroke="#18181B"
                                        strokeWidth="1.33"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </Button>
                                </div>
                              )}
                            </>
                          )}

                          {columnId === "costAmount" && (
                            <>
                              {(() => {
                                // Calculate cost amount from amount and cost, removing any formatting
                                const amount =
                                  parseFloat(
                                    (item.amount || "0").replace(/\s/g, "")
                                  ) || 0;
                                const cost =
                                  parseFloat(
                                    (item.cost || "0").replace(/\s/g, "")
                                  ) || 0;
                                return (amount * cost).toFixed(2);
                              })()}
                            </>
                          )}
                        </td>
                      );
                    } else {
                      // Render additional columns
                      const cellData =
                        additionalColumnData[item.id]?.[
                          additionalColumn?.type || ""
                        ] || "";
                      const displayValue =
                        cellData ||
                        (additionalColumn?.type === "text" ? "—" : "0");

                      return (
                        <td
                          key={columnId}
                          className="min-w-40 max-w-max font-medium py-2 px-3.5 group hover:bg-base-chart-1/[4%] transition-colors duration-200"
                        >
                          {editingDataCell?.rowId === item.id &&
                          editingDataCell?.field === additionalColumn?.type ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editingDataValue}
                                onChange={(e) =>
                                  setEditingDataValue(e.target.value)
                                }
                                className="w-full border border-base-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-base-border bg-white"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleSaveDataCell();
                                  } else if (e.key === "Escape") {
                                    handleCancelDataCell();
                                  }
                                }}
                                autoFocus
                              />
                              <Button
                                variant="outline"
                                className="!size-6 shrink-0 shadow-sm !p-0 !bg-base-chart-1 border-base-chart-1 hover:bg-base-chart-1/90"
                                onClick={handleSaveDataCell}
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M13.3346 4L6.0013 11.3333L2.66797 8"
                                    stroke="white"
                                    strokeWidth="1.33"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </Button>
                              <Button
                                variant="outline"
                                className="!size-6 shrink-0 shadow-sm !p-0"
                                onClick={handleCancelDataCell}
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M12.002 4L4.00195 12M4.00195 4L12.002 12"
                                    stroke="#18181B"
                                    strokeWidth="1.33"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 group">
                              <span
                                className="cursor-pointer hover:bg-base-muted px-2 py-1 rounded transition-colors"
                                onDoubleClick={() =>
                                  handleEditDataCell(
                                    item.id,
                                    additionalColumn?.type || "",
                                    cellData
                                  )
                                }
                              >
                                {displayValue}
                              </span>
                              <Button
                                variant="outline"
                                className="!size-6 shrink-0 shadow-sm !p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                onClick={() =>
                                  handleEditDataCell(
                                    item.id,
                                    additionalColumn?.type || "",
                                    cellData
                                  )
                                }
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                >
                                  <path
                                    d="M10.0026 3.33333L12.6693 6M14.1186 4.54126C14.471 4.18888 14.6691 3.71091 14.6691 3.2125C14.6692 2.71409 14.4713 2.23607 14.1189 1.8836C13.7665 1.53112 13.2885 1.33307 12.7901 1.33301C12.2917 1.33295 11.8137 1.53088 11.4612 1.88326L2.56389 10.7826C2.40911 10.9369 2.29464 11.127 2.23056 11.3359L1.34989 14.2373C1.33266 14.2949 1.33136 14.3562 1.34613 14.4145C1.36089 14.4728 1.39117 14.5261 1.43376 14.5686C1.47634 14.6111 1.52964 14.6413 1.588 14.656C1.64636 14.6707 1.7076 14.6693 1.76523 14.6519L4.66723 13.7719C4.87601 13.7084 5.06601 13.5947 5.22056 13.4406L14.1186 4.54126Z"
                                    stroke="#18181B"
                                    strokeWidth="1.33"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </Button>
                            </div>
                          )}
                        </td>
                      );
                    }
                  })}

                  <td className="min-w-40 max-w-max pl-3.5 relative">
                    <button
                      className="absolute right-0 top-0 !h-full w-13 flex-center border-l border-base-border hover:bg-base-muted"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2.00195 3.99992H14.002M12.6686 3.99992V13.3333C12.6686 13.9999 12.002 14.6666 11.3353 14.6666H4.66862C4.00195 14.6666 3.33529 13.9999 3.33529 13.3333V3.99992M5.33529 3.99992V2.66659C5.33529 1.99992 6.00195 1.33325 6.66862 1.33325H9.33529C10.002 1.33325 10.6686 1.99992 10.6686 2.66659V3.99992M6.66862 7.33325V11.3333M9.33529 7.33325V11.3333"
                          stroke="#DC2626"
                          strokeWidth="1.33"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isExpanded && (
        <div className="relative z-50">
          <AddProductDropdown
            onAddFromList={handleOpenAddProduct}
            onQuickAdd={handleQuickAdd}
            onCopyFromGroup={onCopyFromGroup}
            onCopyAllGroupsFromVariant={onCopyAllGroupsFromVariant}
            variants={variants}
          />
        </div>
      )}
      {showAddProductModal && (
        <AddProduct
          isOpen={showAddProductModal}
          onClose={() => setShowAddProductModal(false)}
          onAddProducts={handleAddProducts}
          groupId={groupId}
        />
      )}
    </div>
  );
}
