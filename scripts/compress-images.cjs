#!/usr/bin/env node
/**
 * 原地压缩 public/images/*.png（引用零改动）。
 *
 * 用法：
 *   node scripts/compress-images.cjs                 # 批量压缩（跳过 <50KB）
 *   node scripts/compress-images.cjs orm.png         # 只压指定文件
 *   node scripts/compress-images.cjs --no-palette    # 禁用 palette 量化（无损-ish 逃生舱）
 *
 * palette: true 走 256 色量化，对截图/线框图收益大；
 * 渐变阴影重的图若出现色带，用 --no-palette 重压该文件。
 */
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
const MIN_SIZE = 50 * 1024; // 跳过 <50KB

const args = process.argv.slice(2);
const usePalette = !args.includes('--no-palette');
const onlyFile = args.find((a) => !a.startsWith('--'));

async function compressOne(file) {
  const src = path.join(IMAGES_DIR, file);
  const before = fs.statSync(src).size;
  if (!onlyFile && before < MIN_SIZE) {
    console.log(`skip  ${file}  ${(before / 1024).toFixed(0)}KB (<50KB)`);
    return;
  }

  const tmp = src + '.tmp';
  let pipeline = sharp(src);
  if (usePalette) {
    pipeline = pipeline.png({ palette: true, quality: 90, compressionLevel: 9 });
  } else {
    pipeline = pipeline.png({ palette: false, compressionLevel: 9, adaptiveFiltering: true });
  }
  await pipeline.toFile(tmp);

  const after = fs.statSync(tmp).size;
  if (after >= before) {
    fs.unlinkSync(tmp);
    console.log(`keep  ${file}  ${(before / 1024).toFixed(0)}KB (压缩后更大，保留原图)`);
    return;
  }
  fs.renameSync(tmp, src);
  const pct = (((before - after) / before) * 100).toFixed(1);
  console.log(
    `done  ${file}  ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB  (-${pct}%)`
  );
}

(async () => {
  const files = onlyFile
    ? [onlyFile]
    : fs.readdirSync(IMAGES_DIR).filter((f) => f.toLowerCase().endsWith('.png'));

  for (const f of files) {
    try {
      await compressOne(f);
    } catch (err) {
      console.error(`FAIL  ${f}: ${err.message}`);
      process.exitCode = 1;
    }
  }
})();
