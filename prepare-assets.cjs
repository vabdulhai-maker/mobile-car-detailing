const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');
const [heroSource, servicesSource] = process.argv.slice(2);
if(!heroSource || !servicesSource) {
  console.error('Usage: npm run prepare:assets -- path/to/hero.png path/to/services.png');
  console.error('Optional only: the website already includes all optimized images.');
  process.exit(1);
}
async function main() {
  const destination = path.join(__dirname,'assets');
  fs.mkdirSync(destination,{recursive:true});
  for(const width of [640,960,1440]) await sharp(heroSource).resize(width).webp({quality:82}).toFile(path.join(destination,`hero-${width}.webp`));
  await sharp(servicesSource).resize(1536).webp({quality:83}).toFile(path.join(destination,'services.webp'));
}
main().catch(error=>{console.error(error.message);process.exit(1)});
