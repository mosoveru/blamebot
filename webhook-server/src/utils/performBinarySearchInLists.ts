import { Label, User } from '../types/gitlab';

export function performBinarySearchInLists<T extends Label | User>(
  listOfCurrentUnsortedEntities: T[],
  listOfPreviousEntities: T[],
) {
  const addedEntities: T[] = [...listOfCurrentUnsortedEntities].sort((a, b) => a.id - b.id);
  const previousEntities: T[] = [...listOfPreviousEntities];
  const deletedEntities: T[] = [];

  while (previousEntities.length) {
    const element = previousEntities.pop()!;

    let left = 0;
    let right = addedEntities.length - 1;
    let isChanged = false;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      if (addedEntities[mid].id === element.id) {
        addedEntities.splice(mid, 1);
        isChanged = true;
        break;
      }

      if (addedEntities[mid].id < element.id) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    if (!isChanged) {
      deletedEntities.push(element);
    }
  }
  if (!deletedEntities.length) {
    return {
      added: addedEntities,
    };
  }
  if (!addedEntities.length) {
    return {
      deleted: deletedEntities,
    };
  }
  return {
    added: addedEntities,
    deleted: deletedEntities,
  };
}
