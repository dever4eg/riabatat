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
