import { DataParser } from '../types';
import { Label, User } from '../types/gitlab';

export interface DataParserConstructor {
  new (searcher: BinarySearcher): DataParser<any>;
}

export type BinarySearcher = <T extends Label | User>(
  listOfCurrentUnsortedEntities: T[],
  listOfPreviousEntities: T[],
) => BinarySearcherReturnValue<T>;

type BinarySearcherReturnValue<T extends Label | User> = {
  added?: T[];
  deleted?: T[];
};
