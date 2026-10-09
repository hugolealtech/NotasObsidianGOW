
# Critérios de Julgamento e Modalidades (Lei 14.133)
Tags: #DireitoAdministrativo #Licitações #NLLC #MapaMental

> [!abstract] Resumo Estratégico
> A **Modalidade** é o procedimento (o caminho). O **Critério de Julgamento** é o parâmetro matemático/técnico para escolher o vencedor (a regra de vitória).

## Mapa Mental (Mermaid)
## Mapa Mental (Flowchart)

```mermaid
flowchart LR
    Raiz{"Critérios de Julgamento<br>(Art. 33)"}

    %% Ramificações principais
    Raiz --> C1[Menor Preço]
    Raiz --> C2[Maior Desconto]
    Raiz --> C3[Maior Lance]
    Raiz --> C4[Melhor Técnica ou Arte]
    Raiz --> C5[Técnica e Preço]
    Raiz --> C6[Maior Retorno Econômico]

    %% Menor Preço
    C1 --- C1_1("Bens/serviços comuns e<br>obras padronizadas (ex: rodovia)")
    C1_1 -.-> C1_2>Modalidades: Pregão / Concorrência]

    %% Maior Desconto
    C2 --- C2_1("Tabelas oficiais e catálogos<br>(ex: peças de frota)")
    C2_1 -.-> C2_2>Modalidades: Pregão / Concorrência]

    %% Maior Lance
    C3 --- C3_1("Alienação/Venda de bens públicos<br>(ex: frota velha, imóveis)")
    C3_1 -.-> C3_2>Modalidade: Exclusivamente Leilão]

    %% Melhor Técnica ou Arte
    C4 --- C4_1("Preço fixado no edital,<br>foco no projeto intelectual")
    C4_1 -.-> C4_2>Modalidade: Concurso]

    %% Técnica e Preço
    C5 --- C5_1("Natureza intelectual, TI<br>e obras especiais")
    C5_1 -.-> C5_2>Modalidades: Concorrência / Diálogo]

    %% Maior Retorno Econômico
    C6 --- C6_1("Contrato de Eficiência<br>(remuneração via % de economia)")
    C6_1 -.-> C6_2>Modalidades: Concorrência / Diálogo]

    %% Estilização básica para facilitar a leitura
    style Raiz fill:#2c3e50,stroke:#fff,color:#fff
    style C1 fill:#27ae60,stroke:#fff,color:#fff
    style C2 fill:#27ae60,stroke:#fff,color:#fff
    style C3 fill:#c0392b,stroke:#fff,color:#fff
    style C4 fill:#8e44ad,stroke:#fff,color:#fff
    style C5 fill:#2980b9,stroke:#fff,color:#fff
    style C6 fill:#f39c12,stroke:#fff,color:#fff
      
      