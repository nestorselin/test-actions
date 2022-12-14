import { outdent } from 'outdent';
import {
 StyleguideConfig, BaseResolver, lintDocument,
} from '@redocly/openapi-core';
import {DecoratorConfig, resolveStyleguideConfig, RuleConfig} from "@redocly/openapi-core/lib/config";
import {parseYamlToDocument} from "@redocly/openapi-core/lib/benchmark/utils";

export async function makeConfig(
  rules: Record<string, RuleConfig>,
  decorators?: Record<string, DecoratorConfig>,
  configPath?: string
) {
  return new StyleguideConfig(
    await resolveStyleguideConfig({
      styleguideConfig: {
        plugins: [],
        extends: [],
        rules,
        decorators,
      },
    }),
    configPath
  );
}

async function lint() {
  const document = parseYamlToDocument(
    outdent`
    swagger: '2.0'
info:
  version: '1.0'
  title: To-do Demo
  description: Hello
  contact:
    name: Stoplight
    url:
      https: //stoplight.io
  license:
    name: MIT
host: todos.stoplight.io
schemes:
  - http
consumes:
  - application/json
produces:
  - application/json
securityDefinitions:
  apikey-key:
    type: apiKey
    in: header
    name: api-key-header
  basicAuth:
    type: basic
  oauth2:
    type: oauth2
    flow: accessCode
    authorizationUrl: 'https://accounts.google.com/o/oauth2/auth'
    tokenUrl: 'https://accounts.google.com/o/oauth2/token'
paths:
  '/todos/{todoId}':
    parameters:
      - name: todoId
        in: path
        required: true
        type: string
    get:
      operationId: GET_todo
      summary: Get Todo
      tags:
        - Todos
      responses:
        '200':
          description: ''
          schema:
            '$ref': '#/definitions/todo-full'
          examples:
            application/json:
              id: 1
              name: get food
              completed: false
              completed_at: '1955-04-23T13: 22: 52.685Z'
              created_at: '1994-11-05T03: 26: 51.471Z'
              updated_at: '1989-07-29T11: 30: 06.701Z'
            random: "{\\n\\t\\"foo\\": \\"bar\\"\\n}\\n"
        '404':
          description: Not found
        '500':
          description: Internal Server Error
    put:
      operationId: PUT_todos
      summary: Update Todo
      tags:
        - Todos
      parameters:
        - name: body
          in: body
          schema:
            '$ref': '#/definitions/todo-partial'
            example:
              name: my todo's new name
              completed: false
      responses:
        '200':
          description: ''
          schema:
            '$ref': '#/definitions/todo-full'
          examples:
            application/json:
              id: 9000
              name: It's Over 9000!!!
              completed: true
              completed_at:
              created_at: '2014-08-28T14: 14: 28.494Z'
              updated_at: '2015-08-28T14: 14: 28.494Z'
        '401':
          description: Error Response
        '404':
          description: Error Response
        '500':
          description: Error Response
      security:
        - apikey: []
    delete:
      operationId: DELETE_todo
      summary: Delete Todo
      tags:
        - Todos
      responses:
        '204':
          description: ''
        '401':
          description: Error Response
        '404':
          description: Error Response
        '500':
          description: Error Response
      security:
        - apikey: []
  /todos:
    post:
      operationId: POST_todos
      summary: Create Todo
      tags:
        - Todos
      parameters:
        - name: body
          in: body
          schema:
            '$ref': '#/definitions/todo-partial'
            example:
              name: my todo's name
              completed: false
      responses:
        '201':
          description: ''
          schema:
            '$ref': '#/definitions/todo-full'
          examples:
            application/json:
              id: 9000
              name: It's Over 9000!!!
              completed:
              completed_at:
              created_at: '2014-08-28T14: 14: 28.494Z'
              updated_at: '2014-08-28T14: 14: 28.494Z'
        '401':
          description: Error Response
        '500':
          description: Error Response
      security:
        - apikey: []
      description: |-
        This creates a Todo object.
        Testing \`inline code\`.
    get:
      operationId: GET_todos
      summary: List Todos
      tags:
        - Todos
      parameters:
        - '$ref': '#/parameters/limit'
        - '$ref': '#/parameters/skip'
      responses:
        '200':
          description: ''
          schema:
            type: array
            items:
              '$ref': '#/definitions/todo-full'
          examples:
            application/json:
              - id: 1
                name: design the thingz
                completed: true
              - id: 2
                name: mock the thingz
                completed: true
              - id: 3
                name: code the thingz
                completed: false
            empty: []
        '500':
          description: Error Response
      security:
        - apikey-key: []
        - basicAuth: []
        - oauth2: []
parameters:
  limit:
    name: limit
    in: query
    description: This is how it works.
    required: false
    type: integer
    maximum: 100
  skip:
    name: skip
    in: query
    required: false
    type: string
definitions:
  todo-partial:
    title: Todo Partial
    type: object
    properties:
      name:
        type: string
      completed:
        type:
          - boolean
          - 'null'
    required:
      - name
      - completed
  todo-full:
    title: Todo Full
    allOf:
      - '$ref': '#/definitions/todo-partial'
      - type: object
        properties:
          id:
            type: integer
            minimum: 0
            maximum: 1000000
            x-faker: 10
          completed_at:
            type:
              - string
              - 'null'
            format: date-time
          created_at:
            type: string
            format: date-time
          updated_at:
            type: string
            format: date-time
          user:
            description: Error Response
        required:
          - id
          - user
tags:
  - name: Todos `,
    'test.yaml'
  );

  const results = await lintDocument({
    externalRefResolver: new BaseResolver(),
    document,
    config: await makeConfig({ 'no-identical-paths': 'error' }),
  });
  return results
}
