# 🛡️ async-guard — Analisador Estático para Promessas Não Tratadas em Node.js

**async-guard** é uma ferramenta de análise estática de código focada em detectar usos inseguros de `Promise`, `await` e `async` functions que podem causar **comportamentos imprevisíveis em produção** — especialmente em aplicações que utilizam AdonisJS (v4), Express ou qualquer framework assíncrono.

> 🚨 Detecta situações onde `await` não está protegido por `try/catch`, promessas rejeitadas sem `.catch()` e funções assíncronas propensas a falhar silenciosamente.

---

## 🧠 Por que isso é importante?

No Node.js, promessas rejeitadas **sem tratamento** podem:

-   Causar **erros silenciosos** que explodem somente em produção
-   Gerar **warnings no AdonisJS (v4)** e outros frameworks
-   **Encerrar a aplicação** com `unhandledRejection` se não forem tratadas

Essa ferramenta automatiza a verificação desses riscos antes que causem problemas reais.

---

## ✅ O que ela detecta

-   `await` fora de `try/catch`
-   `.then()` sem `.catch()`
-   `new Promise()` sem tratamento
-   Funções `async` sem bloco `try/catch` interno
-   Gera relatório detalhado por arquivo com localização e snippet de código

---

## 🚀 Como usar

1. Instale as dependências:

```bash
npm install
```

1. Execute o check.js sob o projeto:

```bash
node src/check.js /path/relativo/ou/absoluto
```

## 🧪 Como funciona por dentro?

-   Utiliza `babel` para gerar e percorrer a AST dos arquivos `.js`.

-   Escaneia recursivamente os arquivos da pasta

-   Identifica padrões de uso perigoso de promessas

## 🤝 Contribuindo

Quer contribuir? Toda ajuda é bem-vinda! Aqui estão algumas ideias:

### Sugestões de melhoria:

-   Exporta um relatório legível para auditoria ou CI/CD

-   Adicionar suporte a TypeScript com tipos

-   Permitir configuração via CLI (ex: --json, --output, --ci)

-   Geração de relatórios em HTML ou JSON

-   Sugestões automáticas de fix com lint-style

### Comece agora:

```bash
git clone https://github.com/seu-usuario/async-guard.git
cd async-guard
npm install
```

Crie sua branch:

```bash
git checkout -b minha-feature
```

Envie um PR!💥

## 🧩 Estrutura do projeto

```graphql
.
├──src
    ├── check.js          # Arquivo que inicia o scan
    ├── analyzer.js       # Analisador estático baseado em AST
    └── README.md         # Este arquivo
```
