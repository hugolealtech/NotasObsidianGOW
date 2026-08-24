# Especificação Técnica — Melhorias no Módulo de Disciplinas/Tópicos (Vavilov)

## 1. Contexto

O sistema Vavilov organiza o conteúdo de estudo em uma hierarquia de **Disciplina → Tópico → Subtópico**. Atualmente, o fluxo de cadastro e busca de tópicos apresenta problemas de usabilidade e bugs de integridade de dados que tornam a manutenção do conteúdo lenta e frustrante. Este documento consolida os problemas observados e as melhorias desejadas, para servir de base a uma implementação.

---

## 2. Problemas identificados

### 2.1 Falta de hierarquia visual no cadastro/edição de tópicos (cards)
- Na tela de edição de disciplina, os cards de tópicos e subtópicos são listados de forma "achatada" (flat), sem indicação visual clara de qual tópico é filho de qual pai.
- Isso gera **poluição visual** e obriga o usuário a inferir a hierarquia pela ordem/indentação sutil dos cards, tornando a adição manual de novos subtópicos lenta e propensa a erro (ex.: adicionar um subtópico sob o card errado).

### 2.2 Truncamento de dispositivos legais com múltiplos incisos/artigos
- Ao cadastrar um tópico cujo texto referencia mais de um dispositivo legal (ex.: "Delegação de atribuições (art. 84, parágrafo único): incisos VI, XII e XXV (1ª parte) a Ministros, PGR e AGU"), o sistema **corta/fatia o texto em múltiplos tópicos separados**, um por dispositivo, em vez de manter o conteúdo original agrupado.
- Exemplo observado: um único item de entrada foi dividido automaticamente em três tópicos distintos:
  - "Decreto autônomo (art. 84, VI)..."
  - "Indulto e graça (art. 84, XII)..."
  - "Prover e extinguir cargos públicos federais (art. 84, XXV)..."
- **Causa raiz desconhecida** — precisa ser investigada (ver seção 4).

### 2.3 Falta de método rápido de inclusão em lote (bulk insert)
- Tentativa de editar diretamente o JSON da disciplina para inserir múltiplos tópicos de uma vez não funcionou: ou o formato usado estava incorreto, ou o sistema não reconhece edições manuais no JSON (parser/schema não documentado, sem feedback de erro).
- Não existe hoje, dentro da aplicação, uma função de "importação rápida" que aceite uma lista de tópicos/subtópicos (ex.: texto colado, JSON estruturado ou hierarquia em texto indentado) e os insira automaticamente na disciplina certa, respeitando a relação pai-filho.
- Esse é apontado como o **problema de maior impacto**: a cada nova disciplina, a inclusão manual consome tempo desproporcional à complexidade da tarefa.

### 2.4 Seletor `#quiz-target-select` (usado no Cronômetro de Foco / Arena) não lista todas as disciplinas
- O componente `<select multiple>` que apresenta a árvore de disciplinas/tópicos para seleção de alvo de estudo (usado nas telas "Cronômetro de Foco" e "Arena: Selecionar Batalha") **não exibe todas as disciplinas cadastradas** na busca.
- Também apresenta **limitação visual de altura/paginação** (`size="10"`, `min-height:220px`) que dificulta a navegação em bases de conteúdo grandes (no exemplo real, o `<select>` contém dezenas de disciplinas e centenas de tópicos).
- No fluxo "Cronômetro de Foco", o campo de busca por texto retorna poucos resultados (ex.: 4 disciplinas) mesmo havendo muito mais disciplinas cadastradas — sugerindo bug de indexação/filtro, não apenas limitação de UI.

### 2.5 Visualização de Hierarquia (tela "Hierarquia" do Painel de Controle)
- Apontada como referência de exibição que já funciona razoavelmente bem (mostra disciplina → tópicos → subtópicos com indentação, páginas, método e retenção), mas o usuário sugere que o mesmo padrão hierárquico poderia ser reaproveitado nas outras telas listadas acima.

---

## 3. Requisitos funcionais desejados

| # | Requisito | Prioridade |
|---|-----------|------------|
| R1 | Nos cards de tópico/subtópico, exibir claramente o vínculo pai-filho (indentação consistente, linha guia, breadcrumb ou agrupamento visual por disciplina/tópico-pai). | Alta |
| R2 | Investigar e corrigir o fatiamento automático de texto ao cadastrar tópicos com múltiplos dispositivos legais (artigos/incisos) — o conteúdo colado/digitado deve ser preservado como uma única entrada, a menos que o usuário explicitamente peça a divisão. | Alta |
| R3 | Criar um mecanismo de **inclusão em lote** de tópicos/subtópicos dentro da aplicação (ex.: campo de texto com hierarquia indentada ou colagem de lista, convertido automaticamente em tópicos/subtópicos vinculados à disciplina correta). | **Crítica** |
| R4 | Corrigir o buscador do seletor de alvo (`#quiz-target-select` e telas "Cronômetro de Foco"/"Arena") para retornar **todas** as disciplinas e tópicos cadastrados, não um subconjunto. | Alta |
| R5 | Resolver a limitação visual do `<select>` (altura fixa, sem paginação/scroll virtual eficiente) — considerar substituição por um componente de árvore pesquisável (tree-select) com pai reconhecendo filhos. | Média |
| R6 | Padronizar a exibição hierárquica (pai/filho) em todas as telas que listam disciplinas e tópicos (cadastro, busca de alvo, hierarquia), reaproveitando o padrão já usado na tela "Hierarquia". | Média |

---

## 4. Pontos a investigar tecnicamente (para o desenvolvedor/IA)

1. **Parser de entrada de tópicos**: identificar onde no pipeline de criação de tópico ocorre a divisão do texto (ex.: split por `;`, por quebra de linha, por padrão de "art." ou por algum limite de caracteres). Determinar se é intencional (feature de "smart split") ou bug, e adicionar opção de desativar/confirmar antes de dividir.
2. **Schema do JSON de disciplina**: documentar o schema esperado (campos obrigatórios, formato de IDs como `t_<timestamp>` e `d_<timestamp>`, relação `parent_id`/`topic_id`) para permitir edição manual confiável e validar entradas com mensagens de erro claras em vez de falha silenciosa.
3. **Fonte de dados do `#quiz-target-select`**: verificar se a query/endpoint que popula esse componente aplica algum filtro (ex.: paginação, limite de resultados, exclusão de disciplinas "adormecidas"/arquivadas) que esteja ocultando disciplinas válidas.
4. **Índice de busca do "Cronômetro de Foco"**: o campo de busca por texto parece usar um índice parcial ou desatualizado — revisar se há cache, debounce incorreto ou filtro por disciplina "ativa" que exclui resultados válidos.

---

## 5. Critérios de aceite sugeridos

- [ ] Ao colar um texto com múltiplos incisos/artigos, o usuário pode optar por mantê-lo como um único tópico ou dividir manualmente — o sistema não faz split automático sem confirmação.
- [ ] Existe uma função de importação em lote acessível a partir da tela de disciplina, que aceita uma lista hierárquica (texto ou JSON) e cria os tópicos/subtópicos corretamente vinculados, em segundos.
- [ ] O seletor de alvo (Cronômetro de Foco / Arena) lista 100% das disciplinas e tópicos cadastrados, com busca funcional por texto parcial.
- [ ] Os cards de tópico exibem visualmente o pai ao qual pertencem (ou os filhos, quando é o pai), sem exigir que o usuário conte níveis de indentação.
- [ ] O componente de seleção hierárquica é navegável mesmo com centenas de itens (scroll, busca ou árvore expansível), sem necessidade de redimensionar a janela do navegador.

---

## 6. Anexos de referência (do relatório original)

- Print da tela de edição de disciplina "DIREITO CONSTITUCIONAL" mostrando cards flat sem hierarquia visual clara.
- Anotação manual do usuário: *"Uma alternativa poderia ser a adição de tópicos e subtópicos diretamente em hierarquia."*
- Print do HTML do componente `#quiz-target-select`, confirmando que a estrutura de dados (optgroup por disciplina, indentação via `&nbsp;` e `↳`) já contém a relação pai-filho — o problema está na exibição/filtro, não na ausência do dado.
- Print da tela "Cronômetro de Foco" mostrando resultado de busca incompleto.
- Print da tela "Hierarquia" como exemplo de exibição hierárquica considerada adequada.
