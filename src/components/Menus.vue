<template>
  <ElMenu
    router
    mode="horizontal"
  >
    <ElMenuItem index="/">
      <ElIcon>
        <IEpHouse />
      </ElIcon>
      <template #title>
        Home
      </template>
    </ElMenuItem>
    <ElMenuItem index="/about">
      <ElIcon>
        <IEpEleme />
      </ElIcon>
      <template #title>
        About
      </template>
    </ElMenuItem>
  </ElMenu>
</template>
