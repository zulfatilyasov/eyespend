#EyeSpend api

## Общие положения

### Передача параметров

Параметры передаются URL-encoded.

### Формат ответа в случае ошибки

#### Код ответа: 4xx, 5xx
```
{
	error: {
		code: "код_ответа",
		message: "Человеко-читаемое сообщение об ошибке на английском языке"
	}
}
```

## Получить данные для страницы настроек

### Request

**GET** /api/secure/settings

### Response

#### Успех, 200

```
{
  mobileLink: {
    code  - int, код для привязки мобильного устройства
  }
  emailLink: {
    status - string, перечисление: "free" | "linkPending" | "linked",
    address - string, адрес почты пользователя (к которому привязан или будет привязан аккаунт, присутствует, если "linkPending" и "linked")
  },
  emailChangeRequest: {
    status - string, перечисление: "notChanging" | "inProgress",
    address - string, адрес почты пользователя (присутствует, если "inProgress")
  }
}
```

## Инициировать привязку email'а к учётной записи

### Запрос

**POST** /api/secure/linkInit

#### Параметры

- email - string, email пользователя для привязки
- password - string, пароль, который хочет установить пользователь

### Ответ

#### Успех, 201

*Тело ответа пустое*

#### Невалидные параметры, 400

```
{
	error: {
		code: "invalid_email",
		message: "Invalid email has been specified"
	}
}
```

#### E-mail уже занят, 400

```
{
	error: {
		code: "duplicate_email",
		message: "Email has already been taken"
	}
}
```


## Проверка кода из ссылки для привязки e-mail'a

### Запрос

**POST** /api/linkVerify

#### Параметры

- code - string, код из ссылки

### Ответ

#### Успех, 201

```
{
	email - string, адрес почты, к которому будет привязан аккаунт
}
```

#### Невалидные параметры, 400

```
{
	error: {
		code: "invalid_code",
		message: "Invalid code provided"
	}
}
```

## Подтверждение привязки одноразовым паролем

### Запрос

**POST** /api/linkConfirm

#### Параметры

- code - string, код из ссылки
- oneTimePassword - string, одноразовый пароль, полученный на мобильном устройстве

### Ответ

#### Успех, 201

```
{
	authToken - string, токен аутентификации для дальнейшей работы в системе
}
```

#### Неправильный код из ссылки, 400

```
{
	error: {
		code: "invalid_code",
		message: "Invalid code provided"
	}
}
```

#### Неправильный одноразовый пароль, 400

```
{
	error: {
		code: "invalid_one_time_password",
		message: "Invalid one time password provided"
	}
}
```

## Начало привязки email'а с телефона

### Запрос

**POST** /public/1/user/activate_from_phone

### Параметры

- email - string, адрес почты пользователя

### Ответ

#### Успех, 200

```
{
	error_code: 0
}
```

#### Невалидные параметры, 200

```
{
	error_code: 1
}
```

## Подтверждение привязки с телефона

### Запрос

**POST** /api/linkConfirmMobile

#### Параметры

- code - string, код из ссылки
- password - string, пароль для аккаунта

### Ответ

#### Успех, 201

```
{
	authToken - string, токен аутентификации для дальнейшей работы в системе
}
```

#### Неверный код из ссылки, 400

```
{
	error: {
		code: "invalid_code",
		message: "Invalid code provided"
	}
}
```
#### Пароль не отвечает требованиям безопасности, 400

```
{
	error: {
		code: "invalid_password",
		message: "Password is shorter than 5 symbols, or ..."
	}
}
```

## Изменить текущий пароль

При смене пароля все token'ы аутентификации, используемые в других сессиях, удаляются.

### Запрос
**POST** /api/secure/changePassword

#### Параметры
- oldPassword - string, старый пароль
- newPassword - string, новый пароль

### Ответ

#### Успех, 201

*Тело ответа пустое*

#### Неверный старый пароль, 400

```
{
	error: {
		code: "invalid_old_password",
		message: "Invalid old password provided"
	}
}
```

#### Новый пароль не отвечает требованиям безопасности, 400

```
{
	error: {
		code: "invalid_new_password",
		message: "New password is shorter than 5 symbols, or ..."
	}
}
```

## Инициировать смену email'а

### Запрос

**POST** /api/secure/emailChangeInit

#### Параметры

- email - string, новый email пользователя

### Ответ

#### Успех, 201

*Тело ответа пустое*

#### Невалидные параметры, 400

```
{
	error: {
		code: "invalid_email",
		message: "Invalid email address provided"
	}
}
```

#### E-mail уже занят, 400

```
{
	error: {
		code: "duplicate_email",
		message: "Email has already been taken"
	}
}
```

## Подтвердить смену email'а

### Запрос

**POST** /api/emailChangeConfirm

#### Параметры

- code - string, код смены email'а
- password - string, текущий пароль пользователя

### Ответ

#### Успех, 201

*Тело ответа пустое*

#### Неверный пароль, 400

```
{
	error: {
		code: "invalid_password",
		message: "Password is invalid"
	}
}
```

#### Неверный или устаревший код, 400

```
{
	error: {
		code: "invalid_code",
		message: "Invalid code provided"
	}
}
```

## Получить статистику расходов по дням (за весь период пользования)

### Запрос

**GET** /api/secure/stats/dailyExpenses

#### Параметры

- timeOffset - int, Оффсет часового пояса клиента от UTC в секундах

### Ответ

#### Успех, 200
```
[{
	date: "2005-08-09" - string, дата в формате "ГГГГ-ММ-ДД", день, за который просуммированы расходы
	amountInBaseCurrency: 777.25 - numeric, сумма расходов за дату в базовой валюте
},...]
```

- Отсортированы по дате
- Дни, когда не было расходов, заполнены 0
- Начинается со дня первого расхода
- Заканчивается сегодняшним днём
- Если не было ни одного расхода, возвращает пустой массив

##Получить статистику по группам тегов за период

### Запрос

**GET** /api/secure/stats/tagsExpenses

#### Параметры

- dateFrom - int, timestamp начало периода
- dateTo - int, timestamp конец периода
- excludeTags - array [string], теги исключенные из выборки
- includeTags - array [string], теги которые обязательно надо включить в выборку
- limit - int, ограничение на количество записей в выборке
- offset - int, кол-во записей, которое нужно пропустить
- timeOffset - int, Оффсет часового пояса клиента от UTC в секундах
### Ответ

#### Успех, 200
```
[{
	tags:[string,...], группа тегов
	amount:int, сумма по группе
	percentage:int, процент этой группы от общей суммы
},...]
```

##Получить ссылку сформированного xls-файла со списком расходов

### Запрос

**GET** /api/secure/stats/excelFileUrl

#### Параметры

... #TODO: параметры такие же как для получения списка расходов

### Ответ

#### Успех, 200
```
{
  url: string, относительный путь к сгенерированному файлу
}
```

##Авторизация и получение одноразового кода

### Запрос

**GET** /public/1/auth

#### Параметры


### Ответ

#### Успех, 200
```
{
  auth_code: токен
}
```

#### Необходимо продлить подписку, 200
```
{
  code: 'subscription_required',
  message: 'Необходимо продлить подписку'
}
```

##Сохранение расхода (web)

### Запрос

**POST** /api/secure/transactions

#### Параметры

- latitude - float, широта
- longitutde - float, долгота
- amount - float, сумма расхода в валюте currency
- amountInBaseCurrency - float, сумма расхода в валюте baseCurrency
- currency - string, валюта
- baseCurrency - string, базовая валюта
- timestamp - int, время расхода (местное)
- tags - array of string, массив тэгов
- timeOffset - int, смещение местного времени в секундах относительно UTC
- imgUrl - string, url прикрепленного изображения
### Ответ

#### Успех, 201
```
[{
  аттрибуты созданной записи
},...]
```

```