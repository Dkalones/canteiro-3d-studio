# Canteiro 3D Studio

============================================================

ARQUIVOS DE REFERÊNCIA DO PROJETO

============================================================

O projeto utilizará DOIS arquivos principais de referência.

ARQUIVO 1 — LAYOUT DO CANTEIRO

"layout canteiro.pdf"

Este arquivo representa a implantação do canteiro de obras.

Ele deve ser utilizado para determinar:

- posição das instalações provisórias;

- áreas de apoio;

- armazenamento;

- circulação;

- materiais;

- escritório;

- área de construção;

- instalações elétricas;

- demais elementos do canteiro.

ARQUIVO 2 — PLANTA DA UBS

O usuário fornecerá posteriormente a planta da UBS.

A planta da UBS representa a EDIFICAÇÃO QUE ESTÁ SENDO CONSTRUÍDA.

Ela deve ser utilizada para determinar:

- geometria da edificação;

- implantação da UBS;

- paredes;

- ambientes;

- acessos;

- cobertura;

- volumetria;

- elementos arquitetônicos;

- relação da edificação com o canteiro.

============================================================

RELAÇÃO ENTRE OS DOIS ARQUIVOS

============================================================

NÃO tratar os arquivos como projetos independentes.

Eles representam DUAS PARTES DO MESMO ESPAÇO:

LAYOUT DO CANTEIRO

        +

PLANTA DA UBS

        ↓

CANTEIRO DE OBRAS 3D COMPLETO

A UBS deve ser posicionada dentro da área denominada

"Área de Construção" no layout do canteiro.

O modelo final deve representar:

TERRENO

   ↓

CANTEIRO

   ↓

ÁREAS DE APOIO

   ↓

ÁREAS DE ARMAZENAMENTO

   ↓

CIRCULAÇÃO

   ↓

ÁREA DE CONSTRUÇÃO

   ↓

UBS EM CONSTRUÇÃO

============================================================

IMPORTANTE SOBRE A UBS

============================================================

Quando a planta da UBS for fornecida:

NÃO simplificar a UBS para um único bloco.

Utilizar a planta como referência para gerar sua volumetria 3D.

A geometria da UBS deve respeitar o máximo possível:

- formato da planta;

- distribuição dos ambientes;

- paredes;

- acessos;

- circulação;

- áreas externas;

- implantação.

Caso a planta contenha informações suficientes para isso,

criar uma representação 3D arquitetônica simplificada.

O objetivo não é criar um BIM executivo completo.

O objetivo é criar uma MAQUETE 3D INTERATIVA DA UBS

INSERIDA NO CANTEIRO.

============================================================

MODELO FINAL

============================================================

O resultado deve permitir visualizar simultaneamente:

[ TERRENO ]

   ├── Refeitório + Cozinha

   ├── Vestiário

   ├── Instalações Sanitárias

   ├── Lavanderias

   ├── Dormitório 1

   ├── Dormitório 2

   ├── Sala de Reuniões + Lazer

   ├── Almoxarifado

   ├── Brita

   ├── Cal

   ├── Cimento

   ├── Areia

   ├── Água

   ├── Aço

   ├── Escritório

   ├── Fonte de Energia Elétrica

   │

   └── ÁREA DE CONSTRUÇÃO

          │

          └── UBS 3D

A UBS deve ser visualmente o elemento principal da

área de construção, enquanto o restante representa

a infraestrutura do canteiro.

============================================================

NÃO INVENTAR

============================================================

Se uma informação não estiver presente em nenhum dos

arquivos:

NÃO assumir que ela existe.

Não inventar dimensões precisas.

Não inventar ambientes da UBS.

Não inventar a implantação do canteiro.

Não alterar a posição relativa dos elementos.

Quando não houver informação suficiente, utilizar uma

representação simplificada e proporcional.

============================================================

OBJETIVO

============================================================

Transformar os dois desenhos 2D em uma única experiência:

           PLANTAS 2D

               ↓

        INTERPRETAÇÃO ESPACIAL

               ↓

          MODELO 3D

               ↓

       CANTEIRO + UBS

               ↓

       MAPA 3D INTERATIVO

               ↓

          CAMADAS DAS NRs

O usuário deve conseguir "andar" virtualmente pelo

canteiro e entender espacialmente como a obra está

organizada.

This project was built with [Lovable](https://lovable.dev).



## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
