#EyeSpend api
####Версия
2.0
####Данные для страницы настроек
request:
**GET /api/secure/settings**

response:
```sh
{
	linkCode - int, код для привязки мобильного устройства 
	email :{
		verified - bool, true, если email верифицирован
		address - string, e-mail адрес пользователя
	}
}
```
####Привязать email
request: 
**POST /api/secure/linkUser**

params: 
**email**:  email адрес пользователя.

response:
http код **200** в случае успеха.
http код **400** если не валидные параметры.

####Изменить email
request: 
**POST /api/secure/changeEmail**

params:
**email**:  новый email пользователя 
**password**:  текущий пароль

response:
http код **200** в случае успеха.
http код **400**, если не валидные параметры. Описание ошибки в поле message

####Изменить текущий пароль
request:
**POST /api/secure/changePassword**

params:
**password**: новый пароль
**old**: старый пароль

response:
http **200** в случае успеха.
http код **400** если не валидные параметры.  Описание ошибки в поле message