import { writeFile } from 'node:fs/promises'
import crawledProducts from '../src/data/crawledProducts.js'

await writeFile(
  new URL('../src/data/normalizedProducts.json', import.meta.url),
  `${JSON.stringify(crawledProducts, null, 2)}\n`,
  'utf8'
)

console.log(`Normalized ${crawledProducts.length} crawled products.`)
