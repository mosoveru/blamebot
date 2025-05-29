export class BadConfigurationException extends TypeError {
  message = 'Задана неправильная конфигурация бота. Проверьте .env файл.';
}
