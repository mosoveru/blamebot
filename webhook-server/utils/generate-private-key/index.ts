import { createInterface } from 'readline';
import * as crypto from 'crypto';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter random symbols\n\n', (answer) => {
  const hash = crypto.createHash('sha256').update(answer).digest('hex');
  console.log(`\nYour Private JWT Key:\n\n${hash}`);
  rl.close();
});
