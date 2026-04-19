# Ares Technical Plan

## Summary

O Ares tem uma base promissora, mas ainda não está pronto para produção em nível profissional. O principal problema hoje não é falta de funcionalidade; é falta de contrato estável entre camadas, enforcement no backend, cobertura automatizada e consistência operacional.

O deploy básico já existe via GitHub -> Vercel/Render, então CD não é o gargalo principal. O foco deve ficar em:

- autenticação e autorização
- contrato Prisma -> GraphQL -> frontend
- consistência de enums, permissões e tipos
- testes reais
- documentação, migrations e disciplina interna

## Estado Atual

### O que está bom

- Monorepo com `pnpm workspaces` e `turbo`
- Separação física entre `apps/web`, `apps/api`, `packages/db` e `packages/core`
- Prisma + Postgres adequados ao domínio
- Modelagem central já cobre `Game`, `Event`, `League`, `Player`, `Result` e `AuditLog`
- Validação de env existe nos apps
- `tsc --noEmit` passou em `apps/web`, `apps/api`, `packages/core` e `packages/db`
- Há uma base inicial de `DataLoader`
- O deploy automático já está resolvido operacionalmente

### Contratos críticos

- `Prisma -> GraphQL`: quebrado
- `GraphQL -> Apollo web`: quebrado
- `OAuth/JWT -> sessão -> Apollo`: quebrado
- `core -> seed -> sessão/UI`: quebrado
- `README/scripts/env/prisma/operação`: quebrado

## O que precisa ser modificado

### 1. Backend ownership, auth e autorização

#### Mutations sensíveis não estão protegidas na API

- Problema: `games`, `players` e `leagues` expõem mutations sem guardas e sem checagem real de permissão ou ownership.
- Impacto: qualquer cliente que alcance o GraphQL pode contornar as restrições aplicadas no frontend.
- Gravidade: alta
- Modificação: mover autenticação e autorização para o Nest com `GqlAuthGuard`, controle por permissão e ownership nos services.

#### Fluxo de autenticação está quebrado

- Problema: o web chama `signIn("discord")`, mas o NextAuth configurado usa `CredentialsProvider`; o backend redireciona com token em query string; o Apollo não envia identidade para a API.
- Impacto: o login de ponta a ponta não fecha e, se fechado desse jeito, continua inseguro.
- Gravidade: alta
- Modificação: unificar o fluxo de auth, remover token na URL e transportar identidade por cookie seguro ou bearer token real.

### 2. Contrato de dados e GraphQL

#### Models GraphQL não representam corretamente o shape do Prisma

- Problema: `Game`, `League`, `Player` e `_count` esperam campos que o Prisma não entrega diretamente nesse formato.
- Impacto: campos não nulos podem resolver como `undefined`, e o schema vira uma representação enganosa do backend.
- Gravidade: alta
- Modificação: mapear explicitamente Prisma -> DTO GraphQL ou resolver todos os campos derivados com `ResolveField`.

#### O frontend consulta campos que não estão estabilizados

- Problema: o web usa tipos manuais e faz queries em campos desalinhados com o schema real.
- Impacto: erros de runtime e drift de contrato passam sem proteção real.
- Gravidade: alta
- Modificação: adotar GraphQL codegen, eliminar tipos manuais do Apollo e validar documentos automaticamente.

#### Posição de league está inconsistente

- Problema: a lógica de `position` não está consolidada; perfil e tabela dependem de comportamento incompleto ou SQL bruto frágil.
- Impacto: usuário pode ver league errado, vazio ou inconsistente entre telas.
- Gravidade: alta
- Modificação: centralizar a lógica de posição no backend e expor isso como contrato explícito.

### 3. Domínio compartilhado e consistência interna

#### `packages/core` está subutilizado

- Problema: enums, permissões e utilitários continuam espalhados entre Prisma, seed, web e API.
- Impacto: drift entre camadas, duplicação e manutenção mais cara.
- Gravidade: média
- Modificação: transformar `@ares/core` na fonte de verdade para enums, permissões e helpers de domínio.

#### Enums e status estão inconsistentes

- Problema: o banco usa um casing, o `core` usa outro, e a UI compara valores de mais de uma forma.
- Impacto: bugs silenciosos de exibição, permissão e comportamento.
- Gravidade: alta
- Modificação: unificar enums/status de ponta a ponta.

#### Seed e sessão não compartilham o mesmo modelo de permissão

- Problema: a sessão do web inicializa permissões vazias e o seed já divergiu do `core`.
- Impacto: RBAC fica frágil e pouco confiável para qualquer papel que não seja admin.
- Gravidade: alta
- Modificação: centralizar chaves no `core` e carregar permissões reais do backend para JWT/sessão.

### 4. Organização de código e qualidade

#### Hotspots estão grandes demais

- Problema: `apps/web/src/actions/game.ts`, modais grandes e services da API concentram regras demais.
- Impacto: baixa coesão, alto acoplamento e regressão fácil.
- Gravidade: média
- Modificação: extrair serviços de aplicação, schemas, helpers compartilhados e componentes menores.

#### Utilitários e regras simples estão duplicados

- Problema: helpers como `slugify` e normalizações aparecem em mais de um lugar.
- Impacto: correções precisam ser repetidas e podem divergir entre fluxos.
- Gravidade: média
- Modificação: mover utilitários para uma camada compartilhada.

#### Comentários especulativos substituem contrato real

- Problema: partes do código assumem comportamentos sem garanti-los.
- Impacto: fluxos críticos passam a depender de hipótese.
- Gravidade: média
- Modificação: trocar comentário especulativo por tipo, validação e contrato verdadeiro.

#### Scripts de manutenção mascaram ou executam alteração acidental

- Problema: `lint` da API usa `--fix`; `format` raiz usa `|| true`.
- Impacto: comando de verificação pode alterar código e comando de formatação pode esconder erro.
- Gravidade: média
- Modificação: separar comandos de check e fix, remover tolerância artificial a falha.

### 5. Banco, acesso a dados e performance

#### Cliente Prisma está inicializado em mais de um ponto

- Problema: `packages/db` exporta singleton, mas a API cria outro caminho com `DatabaseProvider`.
- Impacto: ambiguidade operacional e configuração duplicada.
- Gravidade: média
- Modificação: escolher um único ponto de construção do PrismaClient.

#### N+1 ainda não está tratado de forma sistêmica

- Problema: existe `DataLoader`, mas ele cobre pouco e não resolve todo o fan-out dos resolvers.
- Impacto: latência cresce conforme as queries ficam mais ricas.
- Gravidade: média
- Modificação: expandir loaders e revisar resolvers críticos.

#### Busca e paginação não mostram tuning suficiente

- Problema: há `contains`, ordenações e paginação sem limite máximo claro; não há estratégia visível de índices não únicos.
- Impacto: degradação de performance com volume.
- Gravidade: média
- Modificação: revisar índices, limites de paginação e padrões de consulta.

### 6. Testes

#### Cobertura real é quase zero

- Problema: a API só cobre o boilerplate `Hello World`; o web não tem testes.
- Impacto: auth, RBAC, contrato GraphQL e league podem quebrar sem alarme.
- Gravidade: alta
- Modificação: criar testes reais na API e testes selecionados no web.

#### Não existe teste de contrato

- Problema: não há validação automatizada entre schema, resolvers e queries Apollo.
- Impacto: drift continua acontecendo sem feedback rápido.
- Gravidade: alta
- Modificação: conectar codegen/validação ao fluxo de desenvolvimento.

### 7. Infraestrutura e operação

#### O deploy automático existe, mas a validação antes do deploy é manual

- Problema: Vercel/Render resolvem a entrega, mas regressão ainda depende de disciplina local.
- Impacto: baixa previsibilidade de qualidade antes do deploy.
- Gravidade: baixa
- Modificação: tratar CI de validação como melhoria posterior, não como prioridade imediata.

#### Migrations versionadas não aparecem no fluxo atual

- Problema: o setup Prisma existe, mas não há fluxo versionado claro de migrations no estado analisado.
- Impacto: mudança de schema depende de conhecimento manual.
- Gravidade: média
- Modificação: formalizar migrations versionadas e documentadas.

#### Documentação e scripts estão defasados

- Problema: README raiz ainda fala de stack anterior e scripts inexistentes; a README da API continua template.
- Impacto: onboarding ruim e operação confusa.
- Gravidade: média
- Modificação: reescrever documentação para o estado real do monorepo.

### 9. Onboarding e personalização

#### Seleção de jogos de interesse no onboarding é mock

- Problema: o wizard de onboarding exibe uma lista mock de jogos para o usuário selecionar, mas a seleção não é persistida no backend.
- Impacto: a personalização de experiência baseada em interesses do usuário não funciona de fato.
- Gravidade: baixa
- Modificação: criar relação `UserGameInterest` (ou similar) no Prisma schema, expor via GraphQL, e persistir as seleções feitas no onboarding. Usar os games reais do banco ao invés do mock.

#### Artefatos gerados estão no Git sem política clara

- Problema: `schema.gql` e `lint-results.json` estão versionados sem ownership definido.
- Impacto: drift, ruído de review e falsa confiança.
- Gravidade: média
- Modificação: decidir claramente o que é fonte e o que é gerado.

### 8. Segurança

#### Playground e introspection estão sempre ligados

- Problema: GraphQL fica exposto sem restrição de ambiente.
- Impacto: superfície desnecessária em produção.
- Gravidade: alta
- Modificação: condicionar recursos por ambiente.

#### Bootstrap da API não mostra hardening básico suficiente

- Problema: falta pacote mínimo evidente de `ValidationPipe`, endurecimento de headers e controle de acesso.
- Impacto: entrada de payload inválido e postura fraca de produção.
- Gravidade: alta
- Modificação: endurecer o bootstrap do Nest.

### 9. Integração e limpeza técnica

#### Web e API estão acoplados por suposições

- Problema: a API só fica "segura" enquanto todo acesso passar pelo frontend atual.
- Impacto: qualquer novo cliente ou ajuste no web pode expor mais fragilidade.
- Gravidade: alta
- Modificação: tornar a API segura por padrão e o frontend apenas um consumidor.

#### Dependências legadas indicam migração incompleta

- Problema: `drizzle-orm` e `postgres` direto ainda aparecem na API.
- Impacto: ruído arquitetural e stack real mal definida.
- Gravidade: baixa
- Modificação: fazer cleanup das dependências e resíduos de migração.

## Prioridades

1. Unificar autenticação e levar autorização para o backend.
2. Corrigir o contrato entre Prisma, GraphQL e frontend.
3. Adotar GraphQL codegen e validação automatizada.
4. Unificar enums, status e permissões em fonte única.
5. Endurecer o bootstrap da API e remover exposições inseguras.
6. Criar testes reais.
7. Reescrever documentação e alinhar scripts.
8. Reduzir hotspots e duplicações.
9. Expandir `DataLoader` e revisar N+1.
10. Fazer cleanup de dependências e resíduos de stack anterior.
11. Formalizar migrations versionadas.
12. Adicionar CI de validação apenas como melhoria posterior.

## Etapas

### Etapa 1. Fechar segurança e contratos principais

- [ ] **1.1 Unificar o fluxo de autenticação**
  - [x] Criar endpoint de `/auth/me` na API para validar IDs de sessão.
  - [x] Remover o `token` da query string no redirecionamento da API (migrar para cookie ou via callback interno).
  - [x] Ajustar o Apollo Link no `apps/web` para injetar o JWT no header `Authorization`.
  - arquivos afetados: `apps/web/src/auth/*`, `apps/api/src/modules/auth/*`, `apps/web/src/lib/apollo/apollo-client.ts`
  - dificuldade: alta | impacto: alto

- [x] **1.2 Unificar enums e permissões em `@ares/core`**
  - [x] Mover `GameStatus`, `EventStatus` e `EventType` do Prisma para o pacote core.
  - [x] Sincronizar casing (UPPERCASE) em todas as camadas (DB, API, Web).
  - [x] Centralizar as chaves de permissão (ex: `manage_games`) no `@ares/core`.
  - arquivos afetados: `packages/core/index.ts`, `packages/db/prisma/schema.prisma`, `apps/web/src/lib/permissions.ts`
  - dificuldade: média | impacto: médio

- [x] **1.3 Levar autorização para o Nest**
  - [x] Implementar `AuthGuard` baseado em Passport-JWT no NestJS.
  - [x] Criar `PermissionsGuard` que consome as permissões centralizadas do `@ares/core`.
  - arquivos afetados: `apps/api/src/modules/auth/guards/*`, `apps/api/src/modules/**/*.resolver.ts`
  - dificuldade: alta | impacto: alto

- [ ] **1.4 Otimização de Performance e Blindagem de Contrato (API)**
  - [ ] Definir classes de DTO específicas no NestJS para garantir que o Schema GraphQL não mude acidentalmente se o Prisma mudar.
  - [ ] Realizar auditoria N+1: Implementar `ResolveField` com DataLoaders para todas as relações (ex: `Game.leagues`, `League.entries`).
  - [ ] Adicionar validações de input rigorosas em todos os `Inputs` usando `class-validator`.
  - arquivos afetados: `apps/api/src/modules/**/*.model.ts`, `apps/api/src/modules/**/*.input.ts`
  - dificuldade: alta | impacto: alto

- [x] **1.5 Adotar GraphQL Codegen (Frontend "Elite Setup")**
  - [x] Configurar `@graphql-codegen` no `apps/web` integrando com Apollo Client.
  - [x] Adicionar script `codegen:watch` para gerar tipos em tempo real durante o desenvolvimento.
  - [x] Configurar validação de contrato no `pre-commit` (Husky/lint-staged) para impedir drift de tipos.
  - [x] Substituir todas as interfaces manuais (ex: `SimpleGame`) pelos tipos gerados automaticamente.
  - arquivos afetados: `apps/web/codegen.ts`, `apps/web/package.json`, `apps/web/src/lib/apollo/queries/*`
  - dificuldade: média | impacto: alto

### Etapa 2. Endurecer backend e dados

- [x] **2.1 Endurecer o bootstrap da API**
  - [x] Configurar `ValidationPipe` global com `forbidNonWhitelisted: true`.
  - [x] Implementar restrição de `Introspection` e `Playground` apenas para ambientes não-produção.
  - [x] Configurar `CORS` com whitelist rígida vinda de variáveis de ambiente.
  - arquivos afetados: `apps/api/src/main.ts`, `apps/api/src/app.module.ts`
  - dificuldade: média | impacto: alto

- [ ] **2.2 Criar a primeira suíte de testes real**
  - [ ] Configurar Vitest no `apps/web` com `React Testing Library`.
  - [ ] Implementar testes de integração e unidade na API para os fluxos existentes.
  - arquivos afetados: `apps/api/test/*`, `apps/web/src/**/*.test.tsx`
  - dificuldade: alta | impacto: alto

- [ ] **2.3 Expandir o uso de `DataLoader` e revisar N+1**
  - [ ] Criar loaders para relações `Game -> Leagues` e `League -> Entries`.
  - [ ] Auditar performance das queries principais usando ferramenta de trace ou logs de query.
  - arquivos afetados: `apps/api/src/common/dataloaders/dataloader.service.ts`
  - dificuldade: média | impacto: alto

- [x] **2.5 Formalizar migrations versionadas**
  - [x] Migrar de `prisma db push` para `prisma migrate dev` para manter histórico formal.
  - arquivos afetados: `packages/db/prisma/migrations/*`
  - dificuldade: média | impacto: médio

### Etapa 3. Reduzir complexidade e alinhar operação

- [ ] **3.1 Reestruturar Documentação**
  - [ ] Atualizar o README principal com instruções claras de setup do monorepo e variáveis de ambiente.
  - [x] Criar um documento de referência arquitetural (`ARCHITECTURE.md`) que sirva como fonte de verdade para qualquer agente ou desenvolvedor que precise fazer alterações no projeto. Deve cobrir: estrutura de diretórios e responsabilidade de cada camada (`apps/web`, `apps/api`, `packages/*`), convenções de naming e casing, padrões obrigatórios (ex: onde criar queries GraphQL, como estruturar resolvers, onde ficam validações), componentes de UI reutilizáveis e quando usar cada um, fluxo de dados entre camadas (Prisma → Service → Resolver → Codegen → Frontend), regras de estilo (Tailwind, tokens, variáveis), padrões de i18n, estratégia de permissões e guards, e qualquer _boa_ decisão arquitetural já tomada que deva ser preservada.
  - arquivos afetados: `README.md`, `ARCHITECTURE.md`
  - dificuldade: baixa | impacto: baixo

- [x] **3.2 Reduzir hotspots de complexidade**
  - [x] Refatorar `apps/web/src/actions/*` movendo lógica pesada para services/hooks.
  - arquivos afetados: `apps/web/src/actions/*`
  - dificuldade: média | impacto: médio

- [x] **3.3 Cleanup Técnico**
  - [x] Remover permanentemente `drizzle-orm` e pacotes `postgres` redundantes da API.
  - [x] Padronizar as versões das dependências comuns no monorepo.
  - arquivos afetados: `apps/api/package.json`, `pnpm-lock.yaml`
  - dificuldade: baixa | impacto: baixo

- [ ] **3.4 As rotas GQL precisam puxar apenas os campos necessários**
  - [ ] Analisar as rotas GraphQL atuais e identificar quais campos estão sendo puxados desnecessariamente.
  - [ ] Criar queries novas para puxar apenas os campos necessários para cada necessidade específica, evitando overfetching.
  - arquivos afetados: `apps/web/src/lib/apollo/queries/*`
  - dificuldade: média | impacto: médio

### Etapa 4. Melhorias de UX e Qualidade de Vida

- [x] **4.1 Padronizar next-intl**
  - [x] Reformule e reestruture os arquivos de tradução en.json e pt.json para que fiquem mais organizados e fáceis de manter na atual arquitetura do projeto.
  - [x] Certifique-se de que as traduções não tenham quebrado e que todas as chaves estejam sendo usadas corretamente no código.
  - [x] Analise todos os arquivos que possuem mais de um useTranslation e faça os ajustes necessários para ter apenas um.
  - arquivos afetados: `apps/web/src/**/*.tsx`
  - dificuldade: média | impacto: baixo

- [x] **4.2 Adicionar Logger**
  - [x] Adicionar logger em camadas estratégicas na API para monitorar requisições e erros.
  - [x] Adicionar logger em camadas estratégicas na Web para monitorar requisições e erros.
  - [x] Garantir que apenas logs de erro relevantes sejam exibidos em produção.
  - [x] Usar camadas diferentes de relevância de logs (debug, info, warn, error) e permitir filtrar por elas.
  - dificuldade: média | impacto: médio

- [ ] **4.3 Corrigir inconsistências de UI**
  - [ ] Unificar o design dos modais e formulários para criar uma experiência mais coesa.
  - [ ] Garantir que as mensagens de erro sejam claras e consistentes em toda a aplicação.
  - [ ] Revisar o uso de componentes reutilizáveis para evitar duplicação e inconsistências visuais.
  - [ ] Corrija e faça uso da já criada estrutura de componentes no diretório `apps/web/src/components/templates` seguindo exemplo dos componentes existentes.
  - arquivos afetados: `apps/web/src/components/*`
  - dificuldade: média | impacto: baixo

- [x] **4.4 Corrigir Tailwind e estilos**
  - [x] Certificar-se de que não existem cores hardcoded e que todas as cores estão utilizando as variáveis definidas no Tailwind.
  - [x] Garantir que os estilos sejam consistentes e reutilizáveis, evitando duplicação de código CSS.
  - arquivos afetados: `apps/web/src/**/*.tsx`
  - dificuldade: média | impacto: baixo

- [ ] **4.5 Apagar arquivos legados**
  - [ ] Identificar e remover arquivos que não estão mais em uso ou que foram substituídos por novas implementações.
  - [ ] Garantir que a remoção de arquivos legados não cause quebras na aplicação.
  - arquivos afetados: `apps/**/*`, `packages/**/*`
  - dificuldade: baixa | impacto: baixo

## Validation Basis

- `tsc --noEmit` passou em `apps/web`, `apps/api`, `packages/core` e `packages/db`
- a suíte atual da API passou, mas cobre apenas o boilerplate `Hello World`
- o plano foi construído a partir de leitura do repositório e checagens não destrutivas
