import { OpenAI } from 'openai';
import { prompt } from './prompt';

export interface Env {
	OPENAI_API_KEY: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		try {
			const openAi = new OpenAI({ apiKey: env.OPENAI_API_KEY });

			const arrayBuffer = await request.arrayBuffer();
			const file = new File([arrayBuffer], 'audio.wav');

			const transcript = await openAi.audio.transcriptions.create({
				model: 'whisper-1',
				file: file,
				language: 'en',
			});

			const processedText = await openAi.chat.completions.create({
				model: 'gpt-4',
				messages: [
					{ role: 'system', content: prompt.transcribe.systemMessage },
					{ role: 'user', content: transcript.text },
				],
			});

			const openAiResponse = processedText.choices[0].message.content?.trim();

			if (typeof openAiResponse !== 'string') {
				throw new Error('[unexpected] OpenAiResponse is not text');
			}

			const lines = openAiResponse.split('\n').map((v) => v.trim());

			const title = lines[0];
			const content = lines.slice(1).join('\n').trim();

			return Response.json({ transcript: transcript.text, title, content });
		} catch (err) {
			console.log(err);

			throw err;
		}
	},
};
