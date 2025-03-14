import type { DefaultLogFields, LogOptions } from 'simple-git';
import type { Plugin } from 'vite';
import type { BuildInfo, BundleInfo } from './types';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { simpleGit } from 'simple-git';
import { buildResultToJson, calculateSize, formatDate } from './utils';

export default function buildInfo(): Plugin {
  let closed = false;

  const buildResult = new Map<string, BuildInfo>();
  let buildInfoPath = '';
  let prevBuildResultStr = '';

  return {
    name: 'rollup-plugin-build-info',
    apply: 'build',
    options() {
      const outDir = (this as any).environment.config.build.outDir;
      buildInfoPath = path.join(outDir, 'build-info.json');
      if (fs.existsSync(buildInfoPath)) {
        prevBuildResultStr = fs.readFileSync(buildInfoPath, 'utf-8');
      }
    },
    generateBundle(outputOptions, bundle, _isWrite) {
      try {
        const buildInfo: BuildInfo = {
          chunks: [],
          assets: [],
          totalSize: 0,
        };

        for (const [fileName, asset] of Object.entries(bundle)) {
          const bundleInfo: BundleInfo = {
            fileName,
            size: asset.type === 'chunk'
              ? (asset.code?.length || 0)
              : (asset.source?.toString().length || 0),
            type: asset.type,
          };

          if (asset.type === 'chunk') {
            // bundleInfo.moduleIds = asset.moduleIds;
            // bundleInfo.imports = asset.imports;
            buildInfo.chunks.push(bundleInfo);
          }
          else {
            buildInfo.assets.push(bundleInfo);
          }
        }

        buildInfo.totalSize = calculateSize(buildInfo);

        buildResult.set(outputOptions.format, buildInfo);
      }
      catch (error) {
        console.error('生成构建统计信息时发生错误:', error);
      }
    },
    closeBundle: {
      sequential: true,
      order: 'post',
      async handler() {
        try {
          // 确保只输出一次
          if (closed)
            return;
          closed = true;

          // 如果没有任何构建结果，直接返回
          if (buildResult.size === 0) {
            console.warn('警告: 没有可用的构建统计信息');
            return;
          }

          const git = simpleGit();
          const gitLogOptions: LogOptions = {};
          let prevBuildResult: Record<string, any> = {};
          try {
            prevBuildResult = JSON.parse(prevBuildResultStr);
          }
          catch { }

          if (Array.isArray(prevBuildResult.gitLogs) && prevBuildResult.gitLogs.length) {
            gitLogOptions.from = prevBuildResult.gitLogs[0].hash;
          }

          const logs = await git.log(gitLogOptions).catch(() => {
            return { all: [], latest: null, total: 0 };
          });
          const gitLogs = logs.all.reduce((acc, cur) => {
            if (cur.message.startsWith('Merge branch')) {
              return acc;
            }
            return [
              ...acc,
              { ...cur, date: formatDate(cur.date) },
            ];
          }, [] as DefaultLogFields[]);

          fs.writeFileSync(buildInfoPath, JSON.stringify({ ...buildResultToJson(buildResult), gitLogs }, null, 2), 'utf-8');
        }
        catch (error) {
          console.error('输出构建统计信息时发生错误:', error);
        }
        finally {
          // 清空结果，为下次构建做准备
          buildResult.clear();
        }
      },
    },
  };
}
