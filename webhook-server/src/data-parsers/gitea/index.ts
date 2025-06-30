import { DataParserConstructor } from '../types';
import { IssuesDataParser } from './issues-event';

export const GiteaDataParsers: DataParserConstructor[] = [IssuesDataParser];
