# Configuração do js-distributor

Este guia descreve como configurar o `js-distributor` para distribuir funções de um monolito para servidores independentes usando RabbitMQ.

## Configuração do RabbitMQ

Para configurar o RabbitMQ no `js-distributor`, você precisa definir os seguintes parâmetros:

## Creating a .yaml configuration file

```servers:
  - id: alfa
    port: 5555
    url: localhost
    rabbitmq:
      connectionUrl: amqp://localhost
  - id: beta
    port: 4444
    url: localhost
    rabbitmq:
      connectionUrl: amqp://localhost
  - id: gama
    port: 3333
    url: localhost
    rabbitmq:
      connectionUrl: amqp://localhost

functions:
  - name: funcao1
    server: alfa
    parameters:
      - name: a
        type: number
    method: rabbit
  - name: funcao2
    server: beta
    parameters:
      - name: a
        type: number
    method: rabbit
  - name: funcao3
    server: gama
    parameters:
      - name: a
        type: number
    method: rabbit
  - name: funcao4
    server: alfa
    parameters:
      - name: a
        type: number
    method: rabbit
  - name: funcao5
    server: beta
    parameters:
      - name: a
        type: number
    method: rabbit
```

### Parâmetros de Configuração

- `queue`: Nome da fila que será usada para receber mensagens.
- `exchange_name`: Nome do exchange onde as mensagens serão publicadas.
- `exchange_type`: Tipo do exchange (por exemplo, `direct`, `topic` ou `fanout`).
- `routing_key`: Chave de roteamento usada para direcionar mensagens para a fila correta.
- `callback_queue`: Nome da fila de callback para receber as respostas das mensagens enviadas.

## Configurações Possíveis

### Configuração Padrão

![image](https://github.com/user-attachments/assets/799deacd-08c5-4cfc-b0b1-4657275b623f)

A configuração padrão já pressupõe o uso do RPC, mas ainda sim é possível definir o nome da fila através do parâmetro a seguir como na imagem

- `queue`: alfa_queue

### Definindo Fila de Callback

Além do nome da Fila de Request é possível determinar também o nome da Fila de Callback a seguir 

![image](https://github.com/user-attachments/assets/9d26dcd5-a24f-4e83-b31c-480cac42808e)

- `queue`: alfa_queue
- `callback_queue`: callback_alfa

### Direct Exchange

![image](https://github.com/user-attachments/assets/fed0a36b-339f-474e-8e54-b190fa1bbf84)

Para uilizar o padrão de Exchange do tipo Direct é necessário declarar os seguintes parÂmetros

- `exchange_name`: alfa_exchange
- `exchange_type`: direct
- `routing_key`: server_function1

Ainda é possível definir junto com a Direct Exchange a Fila de Callback também.

### Topic Exchange

![image](https://github.com/user-attachments/assets/6b06d6d6-9f25-4bd9-bee4-ae1338b5cd6e)

Para uilizar o padrão de Exchange o tipo Topic é necessário declarar os seguintes parÂmetros

- `exchange_name`: alfa_exchange
- `exchange_type`: topic
- `routing_key`: server.function1

Ainda é possível definir junto com a Topic Exchange a Fila de Callback também.

### Fanout

Para uilizar o padrão de Exchange do tipo Fanout é necessário apenas definir o nome da exchange

- `exchange_name`: fanout_exchange




