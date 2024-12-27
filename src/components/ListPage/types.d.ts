import type { TableProps } from 'element-plus';

export type TableConfig = Required<Pick<TableProps, 'size'
  | 'border'
  | 'stripe'
  | 'showHeader'
  | 'highlightCurrentRow'
  | 'tooltipEffect'
  | 'tableLayout'
  | 'fit'>
>;
