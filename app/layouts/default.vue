<template>
  <header>
    <PageHeader/>
  </header>
  <main>
    <slot></slot>
    <el-backtop :right="10" :bottom="40" />
  </main>
</template>