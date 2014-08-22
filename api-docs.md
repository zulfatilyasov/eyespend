EyeSpend api
==

Версия
----
2.0

Данные для страницы настроек
--
url:
**/api/secure/settings**

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
Привязать email
---
url: **/api/secure/linkUser**

response:
```sh
http код 200 в случае успеха.
```

Изменить email
---
url: **/api/secure/changeEmail**

response:
```sh
http код 200 в случае успеха.

```

