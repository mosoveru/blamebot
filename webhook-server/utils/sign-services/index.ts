import { sign } from 'jsonwebtoken';
import 'dotenv/config';
import { createInterface } from 'readline';

function signServices() {
  const PRIVATE_JWT_KEY = process.env.PRIVATE_JWT_KEY;
  if (!PRIVATE_JWT_KEY) {
    throw new Error('PRIVATE_JWT_KEY environment variable is not defined');
  }

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the Git Service Name\n\n', (answer) => {
    const serviceName = {
      name: answer.trim(),
    };
    console.log(`Sign using: ${PRIVATE_JWT_KEY}`);
    const token = sign(serviceName, PRIVATE_JWT_KEY);
    console.log(`The Git Service token\n\n${token.trim()}`);

    rl.close();
  });
}

signServices();
