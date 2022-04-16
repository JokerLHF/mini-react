import { ReactNode, ReactNodeChildren } from "../react/interface";
import { FunctionComponent, ReactFiberTag } from "./interface/fiber";
import { mountChildFibers, reconcileChildFibers } from "./ReactChildFiber";
import { FiberNode } from "./ReactFiber";
import { renderWithHooks } from "./ReactFiberHook";
import { processUpdateQueue } from "./ReactUpdateQueue";


const reconcileChildren = (current: FiberNode | null, workInProgress: FiberNode, nextChildren: ReactNodeChildren) => {
  // 首次渲染时只有 root 节点存在 current
  if (current) {
    workInProgress.child = reconcileChildFibers(workInProgress, nextChildren);
  } else {
    workInProgress.child = mountChildFibers(workInProgress, nextChildren);
  }
}

const updateHostRoot = (current: FiberNode, workInProgress: FiberNode) => {
  processUpdateQueue(workInProgress);

  const nextState = workInProgress.memoizedState as Record<string, any>;
  const nextChildren = nextState.element;

  reconcileChildren(current, workInProgress, nextChildren);
  return workInProgress.child;
}


const updateHostComponent = (current: FiberNode | null, workInProgress: FiberNode) => {
  const nextProps = workInProgress.pendingProps;
  let nextChildren = nextProps.children;

  reconcileChildren(current, workInProgress, nextChildren);
  return workInProgress.child;
}

/**
 * 对于 FunctionComponent fiber 来说，需要执行获取 children
 */
const updateFunctionComponent = (current: FiberNode | null, workInProgress: FiberNode) => {
  const { pendingProps, type } = workInProgress
  const children = renderWithHooks(current, workInProgress, type as FunctionComponent, pendingProps);
  if (!children) {
    return null;
  }
  reconcileChildren(current, workInProgress, children);
  return workInProgress.child;
}

/**
 * beginWork 的任务就是将 workInprogress 的子节点变为 fiber 节点。
 */
export const beginWork = (current: FiberNode | null, workInProgress: FiberNode): FiberNode | null => {
  switch (workInProgress.tag) {
    case ReactFiberTag.HostRoot:
      // hostRoot 的 current 肯定存在
      return updateHostRoot(current!, workInProgress);
    case ReactFiberTag.HostComponent:
      return updateHostComponent(current, workInProgress);
    case ReactFiberTag.FunctionComponent:
      return updateFunctionComponent(current, workInProgress);
    case ReactFiberTag.HostText:
      // 文本节点不可能有子节点，直接返回null
      return null;
    default:
      return null;
  }
}