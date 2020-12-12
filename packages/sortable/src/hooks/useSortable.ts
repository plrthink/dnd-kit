import {useContext, useMemo} from 'react';

import {useDraggable, useDroppable, UseDraggableArguments} from '@dnd-kit/core';
import {useCombinedRefs} from '@dnd-kit/utilities';

import {Context} from '../components';
import type {SortingStrategy} from '../types';

export interface Arguments extends UseDraggableArguments {
  strategy?: SortingStrategy;
}

export function useSortable({
  disabled,
  id,
  strategy: localStrategy,
}: Arguments) {
  const {
    items,
    containerId,
    activeIndex,
    clientRects,
    overIndex,
    disableInlineStyles,
    useClone,
    strategy: globalStrategy,
  } = useContext(Context);

  const {
    active,
    activeRect,
    activatorEvent,
    attributes,
    setNodeRef: setDraggableRef,
    listeners,
    isDragging,
    over,
    transform,
  } = useDraggable({
    id,
    disabled,
  });
  const index = items.indexOf(id);
  const data = useMemo(() => ({containerId, index, items}), [
    containerId,
    index,
    items,
  ]);
  const {clientRect, node, setNodeRef: setDroppableRef} = useDroppable({
    id,
    data,
  });
  const setNodeRef = useCombinedRefs(setDroppableRef, setDraggableRef);
  const isSorting = Boolean(active);
  const displaceItem =
    isSorting &&
    isValidIndex(activeIndex) &&
    isValidIndex(overIndex) &&
    !disableInlineStyles;
  const shouldDisplaceDragSource = !useClone && isDragging && displaceItem;
  const dragSourceDisplacement = shouldDisplaceDragSource ? transform : null;
  const strategy = localStrategy ?? globalStrategy;
  const finalTransform = displaceItem
    ? dragSourceDisplacement ??
      strategy({clientRects, activeRect, activeIndex, overIndex, index})
    : null;

  return {
    attributes,
    activatorEvent,
    clientRect,
    isSorting,
    isDragging,
    listeners,
    node,
    overIndex,
    over,
    setNodeRef,
    transform: finalTransform,
  };
}

function isValidIndex(index: number | null): index is number {
  return index !== null && index >= 0;
}
