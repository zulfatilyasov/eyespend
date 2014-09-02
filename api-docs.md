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

#### Успех, 200 (201?)

```
{
	error_code: 0
}
```

#### Невалидные параметры, 400

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

## Подтвердить смену email'а

### Запрос

**POST** /api/secure/emailChangeConfirm

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
