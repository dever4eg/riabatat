## RIA Batat - бот який шукає авто

### Налаштування проекту для розбобки

1. Встановити serverless framework

```
npm i -g serverless
```

2. Скопіювати `.env.example` в `.env`

3. Встановити AWS ключі в `.env`

### Розробка

Запуск API локально:

```
serverless offline
```

Виклик однієї функції локально

```
serverless invoke local -f hello
```

Виклик функції на AWS

```
serverless invoke --function hello
```

### Settings page - сторінка налаштування параметрів пошуку

Для роботи, переходимо в папку settings-page

```
cd settings-page
```

Встановлюємо пакети

```
npm install
```

Для локальної розробки

```
npm run serve
```

Розгортання на aws

```
npm run build
aws s3 sync dist s3://riabatat-dev-settings-page
```
