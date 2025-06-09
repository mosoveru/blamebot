import { RepliesForPossibleErrors } from '@types';

enum ReplyMessages {
  GO_BACK = 'Вернуться назад',
  HELLO_MESSAGE = 'Приветствуем вас! Здесь можно связать ваш телеграм клиент с удалённым реестром репозиториев для получения уведомлений о событиях, происходящих в нём',
  LINK_CLIENT = 'Связать клиент с сервисом',
}

export enum GitProviders {
  GITLAB = 'GITLAB',
  GITEA = 'GITEA',
}

export enum PossibleCauses {
  DATABASE_ERROR = 'DATABASE_ERROR',
  INSTANCE_NOT_FOUND = 'INSTANCE_NOT_FOUND',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  TELEGRAM_INFO_NOT_EXISTS = 'TELEGRAM_INFO_NOT_EXISTS',
  NO_API_HANDLER_FOUND = 'NO_API_HANDLER_FOUND',
  NOT_VALID_TOKEN_SCOPE = 'NOT_VALID_TOKEN_SCOPE',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  CANNOT_AUTHORIZE_CLIENT = 'CANNOT_AUTHORIZE_CLIENT',
}

export const repliesForErrors: RepliesForPossibleErrors<PossibleCauses> = {
  [PossibleCauses.INSTANCE_NOT_FOUND]: 'Не найден инстанс, с которым вы связываете телеграм клиент',
  [PossibleCauses.DATABASE_ERROR]: 'Ошибка при работе с базой данных',
  [PossibleCauses.TELEGRAM_INFO_NOT_EXISTS]: 'Не найден ваш Telegram User ID',
  [PossibleCauses.UNKNOWN_ERROR]: 'Произошла неизвестная ошибка',
  [PossibleCauses.NO_API_HANDLER_FOUND]: 'Не найден обработчик запросов к выбранному провайдеру Git',
  [PossibleCauses.NOT_VALID_TOKEN_SCOPE]:
    'Вы выбрали некорректные разрешения в токене. Создайте новый токен и выберете разрешение на чтение информации о пользователе.',
  [PossibleCauses.CONNECTION_ERROR]: 'Возникли проблемы с подключением. Правильно ли вы указали адрес для подключения?',
  [PossibleCauses.CANNOT_AUTHORIZE_CLIENT]:
    'Невозможно авторизоваться с текущим токеном доступа. Проверьте правильность токена доступа.',
};

export default ReplyMessages;
