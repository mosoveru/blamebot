import { sign } from 'jsonwebtoken';
import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import 'dotenv/config';

function signServices() {
  const PRIVATE_JWT_KEY = process.env.PRIVATE_JWT_KEY;
  if (!PRIVATE_JWT_KEY) {
    throw new Error('PRIVATE_JWT_KEY environment variable is not defined');
  }

  console.log('Sign using: ', PRIVATE_JWT_KEY);

  const readDir = join(__dirname, '../services.json');
  const servicesJson = readFileSync(readDir, 'utf8');
  const services = JSON.parse(servicesJson);

  const tokens = [];
  for (const service of services) {
    tokens.push({
      name: service.name,
      token: sign(service, PRIVATE_JWT_KEY),
    });
  }
  const writeDir = join(__dirname, '../tokens.json');
  writeFileSync(writeDir, JSON.stringify(tokens, null, 2));
}

signServices();
