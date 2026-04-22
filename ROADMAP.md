# Ares — Roadmap de Produto

> Última atualização: Abril 2026  
> Visão de funcionalidades planejadas. Para estado técnico atual, ver `CONTEXT.md`.

---

## Formatos de Competição

- **Ligas**: pontos corridos (round robin), Elo rating (já parcialmente implementado)
- **Torneios com chaveamento**: eliminatória simples, eliminatória dupla (chave dos perdedores), sistema suíço, fase de grupos, montagem de fases personalizadas
- Cada evento pode combinar formatos (ex: fase de grupos → eliminatória)

---

## Comunidade e Social

- **Seguir jogadores + feed de atividade**: usuários seguem outros jogadores e têm um feed personalizado com resultados, mudanças de ranking, novos eventos que entraram, etc. Must-have para comunidade real
- **Fóruns e posts**: criação de tópicos e publicações em páginas — página do usuário (estilo Steam), página da comunidade (jogo), página de um evento
- **Perfis customizáveis**: páginas de usuário altamente personalizáveis, inspiradas em Discord e Steam — o "templo" de cada jogador
- **Sistema de notificações e convites**: convidar usuários para eventos, notificar sobre partidas, atualizações de ranking, posts, etc.
- **Staff de moderação por evento**: organizadores podem definir moderadores com permissões específicas
- **Timeline de carreira do jogador**: linha do tempo no perfil exibindo eventos participados, resultados relevantes (1º lugar, maior série de vitórias) e variações de Elo ao longo do tempo
- **Tabela de líderes cross-evento por jogo**: meta-ranking global por jogo calculado a partir da performance em todos os leagues/tournaments ativos. Para ser justo, deve exigir número mínimo de partidas ou eventos participados como critério de elegibilidade. Futuramente pode evoluir para cross-jogo (jogadores influentes em múltiplos jogos), mas isso exige critérios muito cuidadosos
- **Vouching / reputação comunitária**: após partidas, participantes avaliam uns aos outros em categorias como fair play, pontualidade e comunicação. Agrega um score de reputação visível no perfil — não influencia ranking, serve para confiança comunitária. Importância secundária por enquanto
- **Rivalidades e histórico H2H**: card gerado automaticamente entre jogadores com confrontos frequentes, exibindo win/loss histórico e diferença de Elo ao longo do tempo. Feature de "vida" para o site; baixa importância sistêmica, reservada para futuro distante

---

## Partidas e Matchmaking

- **Disponibilidade e desafio em ligas**: jogadores em leagues (especialmente Elo) podem declarar disponibilidade, e outros jogadores com Elo próximo enviam desafios. A partida aceita entra automaticamente na liga. No perfil, o usuário pode configurar disponibilidade recorrente (ex: "tardes", "fins de semana e quarta-feira"), aplicável a qualquer contexto
- **Partidas avulsas e fila de pickup**: fora de eventos formais, jogadores declaram disponibilidade para um jogo/formato; o sistema faz o match por Elo e gera uma partida avulsa registrada no histórico. Serve como aquecimento contínuo entre eventos

---

## Times, Capitania e Clãs

- **Times com capitão**: times são criados pelos próprios jogadores, com um membro sendo o capitão. O capitão tem permissões de gestão do roster (adicionar/remover membros, submeter resultados pelo time). O organizador do evento apenas aprova ou recusa os times inscritos, sem precisar microgerenciar roster
- **Clãs**: agrupamento de usuários com ranking próprio baseado na performance coletiva dos membros. Complexidade alta — exige modelagem cuidadosa de vínculos entre usuários, times, clãs e resultados

---

## Temporadas

- **Sistema de temporadas manuais**: ao criar um novo evento, o organizador pode informar um evento de origem ("evento pai"). O novo evento herda configurações do anterior e é tratado como uma nova temporada. No frontend, a página do evento exibe navegação integrada entre temporadas (select, tabs ou similar). Sem automação — a criação de temporada é sempre uma ação intencional do organizador

---

## Dados Dinâmicos por Evento

- Criadores de eventos podem definir **campos customizados** para resultados (formulários dinâmicos)
- Podem ser dados gerais do evento ou individuais por jogador (ex: kills, assistências, cura realizada, dano causado, nota na partida)
- Permite que cada comunidade adapte as estatísticas ao seu jogo

---

## Integrações

- **Página "ao vivo"**: seção por jogo exibindo partidas em andamento com link de stream (YouTube, Twitch) quando informado na partida/evento. Crítico para dar sensação de plataforma viva e incentivar participantes a streamar
- **Discord webhook**: organizadores de eventos linkam um webhook de canal Discord e o Ares posta automaticamente resultados de partidas, mudanças no top 3 do ranking e início de fases de torneio. Sem bot — só webhook. No futuro pode evoluir para bot com comandos interativos
- **Steam API**: busca e sugestão de jogos novos caso não existam no projeto, com cacheamento para evitar uso excessivo da API gratuita

---

## Administração e Moderação

- **Painel administrativo**: para usuários com `isAdmin` ou permissões granulares
- **Sistema de banimento/bloqueio**: banir usuários de eventos, jogos ou da plataforma

---

## Performance e Caching

- Cacheamento agressivo de páginas e rankings no Next.js (ISR/revalidação) para reduzir carga na API
- Estratégia essencial para manter performance com infraestrutura enxuta

---

## Modelo de Negócio

- **100% gratuito, para sempre** — nenhuma funcionalidade atrás de paywall
- Open-source e aberto a colaboradores
- Sustentabilidade via patrocinadores e doações

---

## Visão de Longo Prazo

O Ares está evoluindo de uma ferramenta de ligas para uma **plataforma de comunidade competitiva completa**:

1. Qualquer pessoa cadastra um jogo e organiza competições em múltiplos formatos (liga, torneio com chave, sistema suíço, grupos, etc.)
2. Partidas podem ser **agendadas** ou ter **resultados registrados** com evidência (screenshot/vídeo) e dados customizados
3. Rankings são atualizados automaticamente — Elo sensível à margem de placar, pontos, ou métricas do formato
4. Jogadores formam **times** e **clãs** com rankings coletivos
5. Cada página (usuário, jogo, evento) tem **fóruns próprios** e os perfis são altamente customizáveis
6. **Notificações, convites e moderação** criam um ecossistema social completo
7. Tudo 100% gratuito, open-source, sustentado por comunidade

---

## Expansões de Identidade (Ideias Outside the Box)

Além do formato clássico de "torneios e ligas", o Ares possui espaço natural para acomodar conceitos adjacentes que enriquecem o ecossistema e atraem novos tipos de público:

### Confirmadas

- **Metajogo de Facções (Controle de Território)**: Jogadores escolhem uma facção (casas/guildas globais). Vitórias em partidas avulsas ou torneios geram "pontos de influência" para a facção. O próprio site ganha um metajogo onde facções dominam o ranking mês a mês, dando propósito ao jogador que nunca ganharia um torneio individualmente.
- **Hub de Caçadores de Recompensas (Bounties & Challenges)**: Organização de competições assíncronas. Um mural de contratos ("O primeiro a matar o Boss X sem tomar dano", "Speedrun em menos de 2min"). Jogadores dão claim e mandam provas em vídeo. Focado em speedrunners e criadores engajados, não e-sports tradicionais.
- **Economia de Mentoria (Ares Academy)**: Jogadores de alto Elo criam "Bootcamps". Jogadores experientes têm um _Elo de Ensino_ baseado exclusivamente no percentual de evolução dos seus aprendizes. Incentiva cooperação no lugar de toxicidade.
- **Ecossistema LFG Avançado (O "Clube da Esquina")**: Matchmaking baseado em comportamento e "vibe", não ranking. Eventos de confraternização no fim de semana focados na união de perfis parecidos (`[Microfone ON]`, `[Zero Tryhard]`, `[Joga Bebendo]`). Trata do problema crônico da falta com quem jogar em ambientes sem estresse.
- **Oráculo (Mercado de Previsões)**: Jogadores fazem apostas virtuais (sem dinheiro) em partidas e torneios antes de acontecerem — quem vai ganhar, por quanto, quem cai na fase de grupos. Acertos acumulam um _Elo de Previsão_ separado. Cria um e-sport paralelo para espectadores e analistas que nunca competem mas têm prestígio por prever.
- **Bairrismo / Identidade Geográfica**: Jogadores representam sua cidade, estado ou país. Rankings regionais reais com contribuição agregada. Eventos do tipo "clássico regional" ou "cidade vs cidade" emergem naturalmente dos dados. Dá identidade local a uma cultura que hoje é puramente online-anônima.
- **Crônicas (Narrador Automático)**: O site observa padrões nos dados e gera manchetes estilo jornalismo esportivo automaticamente — _"Fulano está há 6 partidas sem perder — maior sequência da temporada"_, _"Estes dois nunca se enfrentaram, e podem ser os finalistas"_. Transforma dados frios em storytelling emergente sem moderação humana. Alto impacto, baixo custo técnico.
- **Laboratório de Formatos**: Usuários inventam formatos de competição próprios, testam em sandbox com partidas simuladas, publicam e outros organizadores adotam. Formatos viram entidades rankeadas por popularidade. Democratiza o game design de competições e cria uma comunidade em torno da criatividade estrutural.

### Possibilidades

- **Hall das Partidas Lendárias**: Partidas podem ser "eternizadas" por voto da comunidade via reações (emojis estilo Discord). O critério de entrada no Hall é o engajamento acumulado. Integração com YouTube e Twitch permite embedar vídeos diretamente no site, com timestamp-linking — usuários comentam e reagem em momentos específicos, e esses links funcionam em posts e fóruns.
- **Wiki por Jogo**: Cada jogo no Ares teria uma wiki própria, funcionando como um Fandom/Wikia integrado — edição colaborativa com controle de moderação. Complementa os fóruns com conteúdo evergreen (guias, lore, mapa de personagens, meta). O organizador ou a comunidade do jogo gerencia o acesso de edição.

---

## Backlog de Implementação

Itens planejados ou em progresso, sem data definida:

- **Seleção de jogos no onboarding**: UI implementada com dados mock; persistir no backend (`UserGameInterest`) ainda não feito
- **Cálculo de Elo no backend**: fórmula definida, mutation de Result com cálculo automático ainda não implementada
- **Refactor de Match/Result**: separar agendamento de partida e registro de resultado
- **Refactor de Player**: repensar vínculo User↔Game; lógica de usernames precisa de novo approach
- **Formatos de torneio**: modelar chaveamentos (eliminatória, suíço, grupos, fases) — apenas ligas existem hoje
- **Times e Clãs**: modelagem completa de equipes, vínculos e ranking coletivo
- **Dados dinâmicos por evento**: formulários customizáveis para estatísticas de partida
- **Fóruns e posts**: sistema de tópicos e publicações por contexto (usuário, jogo, evento)
- **Perfis customizáveis**: personalização rica da página de perfil
- **Notificações e convites**: sistema para convidar jogadores e notificar sobre eventos
- **Painel administrativo**: UI dedicada para admins e moderadores
- **Banimento/bloqueio**: sistema de moderação de usuários
- **Integração Steam API**: busca de jogos com cache
- **Caching de páginas e rankings**: ISR e estratégias de revalidação no Next.js
- **N+1 / DataLoaders**: existem, mas cobrem pouco
- **Testes**: cobertura quase zero (só boilerplate)
- **Padronização i18n**: múltiplos `useTranslations` por arquivo; estrutura dos json pode ser reorganizada
- **Posição no ranking**: lógica de `position` não consolidada
- **CI de validação**: sem pipeline automatizado antes do deploy
