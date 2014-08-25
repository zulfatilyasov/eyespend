Клиентская часть приложения EyeSpend.

Для работы с проектом необходимо установить:

1. nodejs
2. grunt (npm install -g grunt-cli)
3. http-server (npm install http-server -g)

Для запуска выполнить команды:

1. git clone git@red:eyespend/eyespend-web-2.git
2. cd eyespend-web-2
3. npm install
4. grunt
5. cd app
6. node server.js [real]

Сайт будет доступен по адресу http://localhost:3000/

При каждом обновлении страницы будет сгенерировано случайное число транзакций, со случайными данными.


#EyeSpend api

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