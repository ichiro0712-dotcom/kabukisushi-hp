import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface DragHandleProps {
    attributes: Record<string, any>;
    listeners: Record<string, any> | undefined;
}

interface SortableItemProps {
    id: string;
    isEditing: boolean;
    children: (dragHandleProps: DragHandleProps) => React.ReactNode;
}

function SortableItem({ id, isEditing, children }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id, disabled: !isEditing });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as const,
        zIndex: isDragging ? 50 : 'auto' as any,
    };

    return (
        <div ref={setNodeRef} style={style}>
            {children({ attributes, listeners })}
        </div>
    );
}

interface SortableMenuGridProps {
    items: number[];
    isEditing: boolean;
    gridClassName: string;
    onReorder: (newOrder: number[]) => void;
    renderItem: (index: number, dragHandleProps?: DragHandleProps) => React.ReactNode;
    addButton?: React.ReactNode;
}

export function SortableMenuGrid({
    items,
    isEditing,
    gridClassName,
    onReorder,
    renderItem,
    addButton,
}: SortableMenuGridProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.indexOf(Number(active.id));
        const newIndex = items.indexOf(Number(over.id));
        if (oldIndex === -1 || newIndex === -1) return;

        const newItems = [...items];
        newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, Number(active.id));
        onReorder(newItems);
    };

    if (!isEditing) {
        return (
            <div className={gridClassName}>
                {items.map(index => (
                    <div key={index}>{renderItem(index)}</div>
                ))}
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={items.map(i => String(i))}
                strategy={rectSortingStrategy}
            >
                <div className={gridClassName}>
                    {items.map(index => (
                        <SortableItem
                            key={index}
                            id={String(index)}
                            isEditing={isEditing}
                        >
                            {(dragHandleProps) => renderItem(index, dragHandleProps)}
                        </SortableItem>
                    ))}
                    {addButton}
                </div>
            </SortableContext>
        </DndContext>
    );
}
