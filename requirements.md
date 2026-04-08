# **🧪 Teste Técnico — Upload de Arquivos**

## **🎯 Objetivo**

Avaliar a capacidade do candidato de:

* Trabalhar com upload de arquivos (PDF/imagem)  
* Armazenar dados de forma eficiente (evitando base64 no banco)  
* Estruturar backend e frontend  
* Pensar em performance e escalabilidade

---

# **📋 Descrição do Problema**

Você deve construir uma aplicação simples onde o usuário pode:

1. Fazer upload de arquivos (imagem ou PDF)  
2. Visualizar a lista de arquivos enviados  
3. Selecionar um arquivo para visualizar/download

---

# **🧩 Requisitos Funcionais**

## **🔼 Upload de Arquivo**

* Permitir upload de:  
  * Imagens (`.jpg`, `.png`)  
  * PDF (`.pdf`)  
* O arquivo **não deve ser salvo no banco de dados em base64**  
* O sistema deve:  
  * Fazer upload do arquivo para um storage (cloud)  
  * Salvar no banco **apenas a URL do arquivo**

---

## **📂 Listagem de Arquivos**

* Exibir lista com:  
  * Nome do arquivo  
  * Tipo (imagem/pdf)  
  * Data de upload  
* Deve permitir:  
  * Selecionar um arquivo

---

## **👁️ Visualização**

* Ao selecionar:  
  * Se for imagem → mostrar preview  
  * Se for PDF → abrir ou permitir download

---

# **🏗️ Requisitos Técnicos**

## **Backend**

* Preferencialmente usar:  
  * NestJS  
* Banco:  
  * PostgreSQL

### **🚨 Regra importante (principal do teste):**

❌ NÃO salvar arquivo em base64 no banco  
 ✅ Salvar apenas metadados \+ URL

### **Estrutura esperada do documento:**

{  
  "id": "uuid",  
  "name": "file.pdf",  
  "url": "https://storage.com/file.pdf",  
  "type": "application/pdf",  
  "size": 123456,  
  "createdAt": "2026-04-07T10:00:00Z"  
}

## **Frontend**

* Preferencialmente usar:  
  * React \+ Typescript \+ Tailwind  
* Funcionalidades:  
  * Upload com input file  
  * Listagem dos arquivos  
  * Seleção e preview

# **⚡ Requisitos de Qualidade**

## **🧠 Esperado (mínimo)**

* Upload funcional  
* Listagem funcionando  
* Banco salvando apenas URL

