import { DataParserConstructor } from '../types';
import { GiteaDataParser } from './gitea-events';

export const GiteaDataParsers: DataParserConstructor[] = [GiteaDataParser];
