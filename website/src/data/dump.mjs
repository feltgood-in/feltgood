import fs from 'fs';
import { categories, products } from './products.js';

const data = {
  categories,
  products
};

fs.writeFileSync('../../../server/data/db.json', JSON.stringify(data, null, 2));
console.log('Database dumped to server/data/db.json');
