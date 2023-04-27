import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import express from 'express';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanChatMessage, SystemChatMessage } from 'langchain/schema';

dotenv.config();

export function isRateLimitExceeded(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'response' in err &&
    typeof err['response'] === 'object' &&
    err['response']?.['status'] === 429
  );
}

const chat = new ChatOpenAI({
  temperature: 0.5,
  openAIApiKey: process.env.OPENAI_API_KEY ?? '',
  maxRetries: 1,
});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/gpt', (_req, res) => {
  res.send({ text: 'Use POST method to send a query' });
});

app.post('/gpt', async (req, res) => {
  const prompt = req.body.prompt as string;
  const schema = req.body.schema as string;

  if (!prompt || !schema) {
    res.send({ text: 'Empty query or schema' });
    return;
  }

  try {
    const chatResponse = await chat.call([
      new SystemChatMessage(`
      You are a software engineer and you need to construct a GraphQL query. The query needs to be valid. This is information about the GraphQL schema: ${JSON.stringify(
        schema,
      )},
        `),
      new HumanChatMessage(`Give me a query based on the instruction: ${prompt}`),
    ]);

    const gqlResponse = chatResponse.text
      .match(/query\s*\{[\s\S]*?```/)
      ?.join()
      .replace('```', '');

    if (gqlResponse) {
      res.send({ text: gqlResponse });
      return;
    }

    res.send({
      errorMessage: "Couldn't construct a valid query.",
      err: new Error(chatResponse.text),
    });
  } catch (err: any) {
    if (isRateLimitExceeded(err)) {
      res.status(429).send({ errorMessage: 'OpenAI limit exceeded. Try again later 🙏', err });
      return;
    }
    res.status(500).send({ errorMessage: 'Something went wrong. Try again later 🙏', err });
  }
});

export const handler = app;
