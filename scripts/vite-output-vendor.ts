/**
 * 分包思路: 按依赖包维度做稳定 vendor 分包”，目标更偏缓存命中和可读性，而不是尽量减少 chunk 数量。
    - vue 和 @vue/* 单独收敛到 vendor-vue，因为它们是核心运行时，体积和变更频率都适合独立缓存。
    - dependencies 里的大多数包，各自拆成 vendor-包名，比如 element-plus、axios、vue-router、pinia。
    - skipModules 里的包不参与“按包单拆”，让它们落回默认逻辑或兜底 chunk。
    - 任何没被 dependencies 精确命中的 node_modules 模块，最后统一进 vendor，避免出现遗漏模块散落到业务 chunk 里。
  优点:
    - 缓存命中率高，因为每个依赖包都有一个稳定的 chunk 名称，不会因为版本更新而改变。
    - 可读性好，因为每个依赖包都有一个唯一的 chunk 名称，方便调试和分析。
    - 不会把所有三方库都压成一个超大的 vendor 包。
  缺点:
    - chunk 会比较多，请求数增加。
    - 某些很小的依赖单独拆包，缓存收益未必比请求开销更大。
    - 如果依赖树里有很多二级包或内部子路径，没有被你的前缀规则命中时，会进兜底 vendor，所以最终不是“完全一包一 chunk”，而是“尽量按顶层依赖拆”。
 */

import * as path from 'node:path';
import { dependencies } from '../package.json';

const skipModules = ['nprogress', 'vue'];
const vueDir = path.join(process.cwd(), 'node_modules', 'vue/');
const vueScopeDir = path.join(process.cwd(), 'node_modules', '@vue/');
const vendorDir = path.join(process.cwd(), 'node_modules');
const getPkgDirPrefix = (packageName: string) => path.join(process.cwd(), 'node_modules', `${packageName}/`);

const dependencyDirMap = Object.keys(dependencies).reduce((acc, key) => {
  if (skipModules.includes(key))
    return acc;

  const pkgDirPrefix = getPkgDirPrefix(key);
  const value = getVendorChunkLabel(key);

  return {
    ...acc,
    [pkgDirPrefix]: value,
  };
}, {} as Record<string, string>);

/**
 * 根据包名生成稳定的 vendor chunk 名称。
 * @param packageName npm 依赖包名。
 * @returns vendor chunk 名称。
 */
function getVendorChunkLabel(packageName: string): string {
  return `vendor-${packageName.replace('@', '').replace('/', '-')}`;
}

/**
 * 根据模块路径匹配依赖包对应的 vendor chunk 名称。
 * @param id 当前模块绝对路径。
 * @param dependencyDirMap 依赖目录前缀与 chunk 名的映射。
 * @returns 命中的 vendor chunk 名称，未命中时返回 null。
 */
function resolveDependencyChunkName(id: string, dependencyDirMap: Record<string, string>): string | null {
  for (const pkgDirPrefix in dependencyDirMap) {
    if (id.startsWith(pkgDirPrefix)) {
      return dependencyDirMap[pkgDirPrefix];
    }
  }

  return null;
}

/**
 * 生成 Rolldown codeSplitting groups，保持现有 vendor 拆分策略。
 * @param isBuild 当前是否为构建命令。
 * @returns 返回匹配优先级明确的 codeSplitting groups。
 */
export function createVendorGroups(isBuild: boolean) {
  if (!isBuild) {
    return [];
  }

  return [
    {
      name: 'vendor-vue',
      priority: 3,
      test(id: string) {
        return id.startsWith(vueDir) || id.startsWith(vueScopeDir);
      },
    },
    {
      priority: 2,
      test(id: string) {
        return id.startsWith(vendorDir);
      },
      name(id: string) {
        return resolveDependencyChunkName(id, dependencyDirMap);
      },
    },
    {
      name: 'vendor',
      priority: 1,
      test(id: string) {
        return id.startsWith(vendorDir);
      },
    },
  ];
}

type GetManualChunk = (id: string) => string | null | undefined | void;

export function splitVendor(isBuild: boolean): GetManualChunk {
  if (!isBuild) {
    return function manualChunks(_id: string) { };
  }

  dependencyDirMap[vueDir] = 'vendor-vue';
  dependencyDirMap[vueScopeDir] = 'vendor-vue';

  return function manualChunks(id: string) {
    for (const pkgDirPrefix in dependencyDirMap) {
      if (id.startsWith(pkgDirPrefix)) {
        return dependencyDirMap[pkgDirPrefix];
      }
    }
    if (id.startsWith(vendorDir)) {
      return 'vendor';
    }
  };
}
