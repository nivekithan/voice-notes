import { OpenAI } from "openai";
import { FormData } from "@cloudflare/workers-types/2023-07-01";

export interface Env {
  OPENAI_API_KEY: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    try {
      const formData = (await request.formData()) as FormData;

      const audio = formData.get("audio");
      const systemMessage = formData.get("systemMessage");
      const currentText = formData.get("currentText");

      if (!(audio instanceof File)) {
        return Response.json(
          { message: "Expected audio to be file" },
          { status: 400 },
        );
      }

      if (typeof systemMessage !== "string") {
        return Response.json(
          { message: "Expected system message to be string" },
          { status: 400 },
        );
      }

      console.log({ systemMessage });

      const isCreatingNewNote = typeof currentText !== "string";

      if (isCreatingNewNote) {
        const { content, title, transcript } = await createNewNote({
          audio,
          env,
          systemMessage,
        });
        return Response.json({ transcript, title, content });
      }

      const { text } = await updateNote({
        audio,
        currentText,
        env,
        systemMessage,
      });
      return Response.json({ content: text });
    } catch (err) {
      console.log(err);

      throw err;
    }
  },
};

async function getTranscript({ audio, env }: { env: Env; audio: File }) {
  const openAi = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const transcript = await openAi.audio.transcriptions.create({
    model: "whisper-1",
    file: audio,
    language: "en",
  });

  return transcript.text;
}

async function createNewNote({
  audio,
  systemMessage,
  env,
}: {
  audio: File;
  systemMessage: string;
  env: Env;
}) {
  const openAi = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const transcript = await getTranscript({ audio, env });

  const openAiResponse = await openAi.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: transcript },
    ],
  });

  const processedText = openAiResponse.choices[0].message.content?.trim();

  if (typeof processedText !== "string") {
    throw new Error("[unexpected] OpenAiResponse is not text");
  }

  const lines = processedText.split("\n").map((v) => v.trim());

  const title = lines[0];
  const content = lines.slice(1).join("\n").trim();

  return { title, content, transcript };
}

async function updateNote({
  audio,
  currentText,
  env,
  systemMessage,
}: {
  audio: File;
  systemMessage: string;
  env: Env;
  currentText: string;
}) {
  const openAi = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const transcript = await getTranscript({ audio, env });

  const humanContent = `--Current Text Starts--
${currentText}
--Current Text Ends--
	
--New Text Starts--
${transcript}
--New Text Ends--`;

  const openAiResponse = await openAi.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: humanContent },
    ],
  });

  const text = openAiResponse.choices[0].message.content;

  if (!text) {
    throw new Error("Open ai did not send response");
  }

  return { text: text.trim() };
}
