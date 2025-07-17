import type { TableColumnInstance, TableInstance, TableProps } from 'element-plus';
import type { VNode } from 'vue';

export type Emits = /** @vue-ignore */ TransformToVueEmitTypes<TableInstance>;

export type TableColumnProps = ExtractPublicPropTypesFromComponentInstance<TableColumnInstance>;

export type TableColumnCustomRender = (slotProps: { row: Record<string, any>, column: TableColumnProps, $index: number }) => VNode;

export interface TableColumnPropsWithRender extends TableColumnProps {
  prop: string
  render?: TableColumnCustomRender
  slots?: {
    default?: TableColumnCustomRender
    header?: (slotProps: { column: TableColumnProps, $index: number }) => VNode
    filterIcon?: (slotProps: { filterOpened: boolean }) => VNode
    expand?: (slotProps: { expanded: boolean }) => VNode
  }
};

export interface Props extends /* @vue-ignore */ Partial<TableProps<Record<string, any>>> {
  data: object[]
  columns: Array<TableColumnPropsWithRender>
}

export interface Slots {
  append: () => any
  empty: () => any
  [key: string]: TableColumnCustomRender
}
