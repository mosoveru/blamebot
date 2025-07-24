# Blamebot 

Телеграм бот с уведомлениями о событиях, произошедших в удалённом реестре репозиториев.

## Содержание

- [Разворачивание бота](#разворачиваем-бота)
- [Инструкции для админа](#создаём-инстансы)
- [Инструкция для обычных пользователей](#инструкция-для-обычных-пользователей)

## Разворачиваем бота

### Требования

- На машине должен быть установлен Docker и Docker Compose

### Инструкция по развёртыванию

Создаём отдельную папку, в которой будем работать. Скачиваем в созданную папку заготовку `.env` файла:

```bash
curl -Ls https://raw.githubusercontent.com/mosoveru/blamebot/refs/heads/main/.env.example -o .env
```

А также скачиваем заготовку `docker-compose.yaml`:

```bash
curl -Ls https://raw.githubusercontent.com/mosoveru/blamebot/refs/heads/main/docker-compose.prod.yaml -o docker-compose.yaml
```

`.env` файл уже будет предзаполнен данными по умолчанию, можете их сменить по желанию.

![](https://raw.githubusercontent.com/mosoveru/blamebot/refs/heads/files/files/env-file-example.png)

В поле `PRIVATE_JWT_KEY` записываем любой сгенерированный случайно ключ, например, с помощью этого сервиса: https://www.uuidgenerator.net/

В поле `BOT_SECRET_TOKEN` записываем секретный токен бота, который вы получите после регистрирования бота через `@BotFather`.

В поле `TG_ADMIN_ID` записываем Telegram ID админа бота. Админ будет обладать правами создания инстансов. Получить ID можно через `@getmyid_bot`.

Всё готово к разворачиванию!

Для включения бота вводим команду:

```bash
docker compose up -d
```

Будут загружены нужные образы, инициирована база данных и бот запустится.

### Важные замечания

1.  Если в инстансах GitLab или Gitea используются самоподписанные сертификаты, то во избежании ошибок в `.env` файл нужно добавить значение:

```
NODE_TLS_REJECT_UNAUTHORIZED=0
```

Иначе пользователи не смогут связать телеграм-клиенты с сервисом уведомлений из-за невалидных сертификатов.

2.  Если в контуре используется локальный DNS, то необходимо модифицировать `docker-compose.yaml`. Для этого нужно добавить параметр `extra_hosts` в `services.bot`. Например:

![](https://raw.githubusercontent.com/mosoveru/blamebot/refs/heads/files/files/docker-bot-extra-hosts.png)

Таким образом бот сможет нормально срезолвить IP сервисов в контуре и ошибок при связывании клиентов с сервисом не будет.

## Создаём инстансы

Интерфейс бота для админа отличается от интерфейса для обычных пользователей:

![](https://raw.githubusercontent.com/mosoveru/blamebot/refs/heads/files/files/admin-interface-example.png)

Нажимаем “**Создать новый инстанс”**. Вводим желаемое имя инстанса:

![](https://raw.githubusercontent.com/mosoveru/blamebot/refs/heads/files/files/creating-new-instance.png)

Выбираем провайдера Git для того инстанса, который вы создаёте:

![](https://raw.githubusercontent.com/mosoveru/blamebot/refs/heads/files/files/admin-git-provider-choice.png)

Теперь необходимо прислать URL инстанса, на котором он хостится:

![](https://raw.githubusercontent.com/mosoveru/blamebot/refs/heads/files/files/admin-instance-url.png)

После этого вам будет прислан JWT токен, который нужно использовать дальше при настройке веб-хуков в репозитории:

![](https://raw.githubusercontent.com/mosoveru/blamebot/refs/heads/files/files/successfully-created-instance.png)

### Важные замечания по поводу URL

- Переживать насчёт висячих слешей не нужно - бот автоматически берёт нужный ему Origin.
- Зарегистрировать несколько инстансов на один URL не получится, он должен быть уникальным в рамках бота.
- **Донесите до коллег какой URL вы используете в инстансе.** Этот URL используется для поиска инстанса в БД при [связывании клиента с сервисом](#инструкция-для-обычных-пользователей).

### Используем JWT токен в репозитории

Создайте новый веб-хук в репозитории GitLab или Gitea. Укажите URL до Webhook сервера. Учитывайте, что по умолчанию сервер запускается на 3000 порту (определяется `HTTP_SERVER_PORT` в `.env`):

```
http://host.docker.internal:3000/gitea - URL для инстанса Gitea
http://host.docker.internal:3000/gitlab - URL для инстанса GitLab
```

**Важно!** Указываете корректный ресурс в зависимости от провайдера Git: если это инстанс Gitea, то ресурс `/gitea`, если это GitLab, то `/gitlab`. Логика обработки веб-хуков меняется в зависимости от провайдера.

Укажите в поле Authorization JWT токен **(для Gitea):**

![](https://raw.githubusercontent.com/mosoveru/blamebot/refs/heads/files/files/where-gitea-token-must-be-pasted.png)

Для инстанса GitLab указывайте JWT токен в поле **Secret Token**:

![](https://raw.githubusercontent.com/mosoveru/blamebot/refs/heads/files/files/where-gitlab-token-must-be-pasted.png)

### Важные замечания по поводу настройки веб-хуков

- Будьте предельно внимательны насчёт того, куда вы вписываете JWT токен! Для Gitea - это строго **Заголовок Authorization,** для GitLab - это строго **Secret Token**.
- Будьте предельно внимательны к ресурсу на конце ссылки: если это инстанс Gitea, то ресурс `/gitea`, если это GitLab, то `/gitlab`.
- Метод HTTP для веб-хуков - **POST**
- Отключите **SSL Verification**, если вы не используете nginx с настроенным **SSL.**
- **Используйте один и тот же JWT токен на все репозитории инстанса. В каждом репозитории в настройках веб-хуков указывайте один и тот же токен. Для других инстансов также во всех репозиториях используйте один и тот же соответствующий токен, который вы получили от бота при регистрации этого инстанса.**

## Доступные типы событий для уведомлений

Для **Gitea:**

![](https://raw.githubusercontent.com/mosoveru/blamebot/refs/heads/files/files/gitea-available-type-of-events.png)

Для **GitLab:**

![](https://raw.githubusercontent.com/mosoveru/blamebot/refs/heads/files/files/gitlab-available-types-of-events.png)

## Инструкция для обычных пользователей

При заходе введите команду /start. Вы увидите стартовое сообщение:

![](https://raw.githubusercontent.com/mosoveru/blamebot/refs/heads/files/files/hello-message.png)

Нажимаем кнопку **Связать клиент с сервисом**:

![](https://raw.githubusercontent.com/mosoveru/blamebot/refs/heads/files/files/send-url.png)

На этом этапе пришлите боту URL, где хостится инстанс GitLab или Gitea.

Переживать насчёт висячих слэшей в конце не стоит: бот автоматически обработает origin ссылки так, как ему нужно.

Вставляем ссылку на инстанс, например, GitLab:

![](https://raw.githubusercontent.com/mosoveru/blamebot/refs/heads/files/files/choose-git-provider.png)

Выбираем нужного провайдера Git. Если вы связываетесь с GitLab, нажимаем соответствующую кнопку, для Gitea аналогично. Выбираем GitLab:

![](https://raw.githubusercontent.com/mosoveru/blamebot/refs/heads/files/files/send-access-token.png)

На этом этапе нам нужно сгенерировать Access Token на чтение информации юзера (Read User) в том инстансе, к которому вы хотите привязаться. Для **GitLab** заходим в Preferences, затем в Access Tokens:

![](https://raw.githubusercontent.com/mosoveru/blamebot/refs/heads/files/files/gitlab-access-token-location.png)

Нажимаем Add token, вводим желаемое имя токена (любое) и выбираем разрешение на чтение пользователя (**read_user**):

![](https://raw.githubusercontent.com/mosoveru/blamebot/refs/heads/files/files/gitlab-access-token-form.png)

Ваш сгенерированный токен:

![](https://raw.githubusercontent.com/mosoveru/blamebot/refs/heads/files/files/generated-gitlab-token.png)

Для **Gitea**:

Заходим в Applications

![](https://raw.githubusercontent.com/mosoveru/blamebot/refs/heads/files/files/gitea-access-token-location.png)

Пишем желаемое имя токена и выбираем разрешение на чтение пользователя (User → Read):

![](https://raw.githubusercontent.com/mosoveru/blamebot/refs/heads/files/files/gitea-access-token-form.png)

Сгенерированный токен появится сверху:

![](https://raw.githubusercontent.com/mosoveru/blamebot/refs/heads/files/files/generated-access-token-gitea.png)

Копируем токен из GitLab или Gitea и вставляем в беседу с ботом:

![](https://raw.githubusercontent.com/mosoveru/blamebot/refs/heads/files/files/paste-access-token.png)

Если не возникнет непредвиденных ошибок, то вы увидете следующее сообщение:

![](https://raw.githubusercontent.com/mosoveru/blamebot/refs/heads/files/files/successful-linking.png)

Теперь вы будете получать уведомления о событиях в GitLab или Gitea.

## Как выглядит уведомления

![](https://raw.githubusercontent.com/mosoveru/blamebot/refs/heads/files/files/notification-example.png)

Если не хотите получать уведомления на конкретную сущность (на определённый Issue или Merge Request), то нажмите кнопку “Отписаться” под уведомлением от этой сущности. При любых изменениях в нём вы не будете получать уведомления.

## Замечания

- Вы как **инициатор события** не будете получать уведомления из бота. Потому что вы сами создали событие, зачем вам уведомление? (Эта логика нарушается для событий Pipeline Events, так как именно вы в большей степени заинтересованы в том, прошли ли пайплайны, ну а также это обусловлено структурой вебхуков для Pipeline Events)
- Но если событие создал кто-то другой, вы получите уведомление.
- Если вас раздражает уведомления, которые кто-то спамит в сущности, либо отпишитесь с помощью кнопки, либо замутьте бота из интерфейса телеграм.
- Кнопка “Отписаться” отписывается вас от уведомлений на **конкретную сущность (issue или merge/pull request)**.

---