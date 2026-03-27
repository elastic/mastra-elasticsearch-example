import { Agent } from "@mastra/core/agent";
import { ElasticSearchVector } from '@mastra/elasticsearch';
import { createVectorQueryTool } from '@mastra/rag';
import { ModelRouterEmbeddingModel } from "@mastra/core/llm";
import { Memory } from "@mastra/memory";

const es_url = process.env.ELASTICSEARCH_URL;
if (!es_url) {
  throw new Error("ELASTICSEARCH_URL is not defined");
}
const es_apikey = process.env.ELASTICSEARCH_API_KEY;
if (!es_apikey) {
  throw new Error("ELASTICSEARCH_API_KEY is not defined");
}
const es_index_name = process.env.ELASTICSEARCH_INDEX_NAME;
if (!es_index_name) {
  throw new Error("ELASTICSEARCH_INDEX_NAME is not defined");
}

const esVector = new ElasticSearchVector({
  id: 'elasticsearch-vector',
  url: es_url,
  auth: {
    apiKey : es_apikey
  }
});

const vectorQueryTool = createVectorQueryTool({
  vectorStore: esVector,
  indexName: es_index_name,
  model: new ModelRouterEmbeddingModel("openai/text-embedding-3-small")
});

export const elasticsearchAgent = new Agent({
  id: "elasticsearch-agent",
  name: "Elasticsearch Agent",
  instructions: `You are a helpful assistant that answers questions based on the provided context.
Follow these steps for each response:

1. First, carefully analyze the retrieved context chunks and identify key information.
2. Break down your thinking process about how the retrieved information relates to the query.
3. Draw conclusions based only on the evidence in the retrieved context.
4. If the retrieved chunks don't contain enough information, explicitly state what's missing.

Format your response as:
THOUGHT PROCESS:
- Step 1: [Initial analysis of retrieved chunks]
- Step 2: [Reasoning based on chunks]

FINAL ANSWER:
[Your concise answer based on the retrieved context]

Important: When asked to answer a question, please base your answer only on the context provided in the tool. 
If the context doesn't contain enough information to fully answer the question, please state that explicitly and stop it.
Do not add more information than what is present in the retrieved chunks.
Remember: Explain how you're using the retrieved information to reach your conclusions.
`,
  model: 'openai/gpt-5-nano',
  tools: { vectorQueryTool },
  memory: new Memory(),
});