# `SlotFallback`

**`v-for + slot` 的局部定制 fallback 模式**

`SlotFallback` 用于解决“列表项支持 scoped slot 局部定制，但未命中的项仍应回退到默认模板”这一类问题。

## 适用场景

适合以下结构：

- 组件内部通过 `v-for` 批量渲染多个 item
- 组件对外暴露带上下文的 slot，例如 `<slot name="item" v-bind="slotProps">...</slot>`
- 调用方只想覆盖部分 item，其余 item 继续复用组件内置的默认渲染

一个典型例子：

```vue
<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      <slot name="item" :item="item" :active="active">
        {{ item.label }}
      </slot>
    </li>
  </ul>
</template>
```

## 问题背景

在 Vue 中，只要调用方声明了某个 slot，对应 slot 就会参与该位置的渲染过程。

这会带来一个常见问题：

- 调用方只想定制少数 item
- slot 内部通常会根据 `item` 或其他上下文做条件判断
- 条件未命中时，slot 往往返回空内容
- 如果组件只根据某个 slot 是否存在来决定是否使用默认模板，那么默认内容就永远不会执行

也就是说，这里的判断条件不应该是“有没有传 slot”，而应该是“当前这一次 slot 调用的结果是否可渲染”。

## 未使用 `SlotFallback` 时的问题

```vue
<template>
  <ComA>
    <template #item="{ item, active }">
      <template v-if="active">
        some custom content
      </template>
      <template v-else>
        {{ item.label }}
      </template>
    </template>
  </ComA>
</template>
```

上面的写法可以工作，但有两个明显问题：

- 调用方不得不重复组件默认模板
- 默认模板一旦调整，调用方也要同步修改，维护成本高

## 使用 `SlotFallback` 后的写法

组件内部：

```vue
<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      <SlotFallback name="item" :item="item" :active="active">
        {{ item.label }}
      </SlotFallback>
    </li>
  </ul>
</template>
```

调用方：

```vue
<template>
  <ComA>
    <template #item="{ item, active }">
      <template v-if="active">
        some custom content
      </template>
    </template>
  </ComA>
</template>
```

这样一来：

- 命中的 item 使用调用方提供的自定义内容
- 未命中的 item 自动回退到组件内部默认模板
- 调用方不需要重复书写默认内容

## 行为约定

`SlotFallback` 的行为规则如下：

- slot 返回可渲染内容时，优先渲染 slot 结果
- slot 返回空内容时，回退到组件默认 slot
- 每次渲染只调用一次目标 slot
- 命中判断和最终渲染复用同一份 slot 结果，避免重复执行

这里的“空内容”通常包括：

- `undefined`
- 注释节点
- 只包含空白字符的文本节点
- 递归展开后仍然为空的 `Fragment`

## 为什么强调“只调用一次”

一个容易出错的实现方式是：

1. 先执行一次 slot，判断是否需要 fallback
2. 真正渲染时再执行一次 slot

这种双调用虽然逻辑直观，但成本不必要：

- slot 函数会重复执行
- VNode 会重复创建
- 子组件树也可能被重复构造
- 在递归菜单、树节点、长列表等场景下更容易放大性能损耗

因此更合理的实现方式是：

1. 在一次渲染过程中执行一次 slot
2. 保存本次调用得到的 `slotNodes`
3. 基于 `slotNodes` 判断是否需要 fallback
4. 命中时直接复用 `slotNodes`，未命中时渲染默认内容

## 设计价值

`SlotFallback` 本质上是把“局部定制，未命中回退默认模板”这套逻辑从业务组件里抽离出来，带来几个直接收益：

- 调用方模板更简洁
- 默认模板只保留一份，减少重复
- 组件升级默认渲染时，不需要调用方同步复制修改
- 在列表、树、递归菜单等场景中更容易保持渲染语义一致

## 补充说明

这里强调的重点不是 slot 是否“具名”，而是调用方能否拿到“当前这一项”的上下文，并据此决定是否覆盖默认渲染。

因此：

- 具名 scoped slot 是最常见的使用形式
- 默认 slot 如果同样传入了上下文，也会遇到同类问题
- 真正关键的是：组件需要支持“命中时使用自定义内容，未命中时回退默认模板”
