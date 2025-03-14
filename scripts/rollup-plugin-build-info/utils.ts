import type { BuildInfo } from './types';

export function calculateSize(buildInfo: BuildInfo): number {
  return buildInfo.chunks.reduce((sum, file) => sum + file.size, 0) + buildInfo.assets.reduce((sum, file) => sum + file.size, 0);
}

export function printBuildInfo(buildResult: Map<string, BuildInfo>) {
  console.warn('\n构建产物统计:');
  console.warn('-------------------');

  let totalSize = 0;

  for (const [key, value] of buildResult.entries()) {
    console.warn(`${key} 构建:`);
    console.warn(`  Chunks 数量: ${value.chunks.length}`);
    console.warn(`  Assets 数量: ${value.assets.length}`);
    console.warn(`  构建大小: ${(value.totalSize / 1024).toFixed(2)} KB`);
    totalSize += value.totalSize;
  }

  console.warn('\n总计:');
  console.warn(`总构建大小: ${(totalSize / 1024).toFixed(2)} KB`);
}

export function buildResultToJson(buildResult: Map<string, BuildInfo>): Record<string, BuildInfo> {
  const json: Record<string, BuildInfo> = {};
  for (const [key, value] of buildResult.entries()) {
    json[key] = value;
  }
  return json;
}

export function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);
  const hour = `0${date.getHours()}`.slice(-2);
  const minute = `0${date.getMinutes()}`.slice(-2);
  const second = `0${date.getSeconds()}`.slice(-2);

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}
