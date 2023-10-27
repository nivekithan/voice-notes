import { OpenAI } from 'openai';

export interface Env {
	OPENAI_API_KEY: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		try {
			const openAi = new OpenAI({ apiKey: env.OPENAI_API_KEY });
			const formData = await request.formData();

			const audio = formData.get('audio');
			const systemMessage = formData.get('systemMessage');

			if (!(audio instanceof File)) {
				return Response.json({ message: 'Expected audio to be file' }, { status: 400 });
			}

			if (typeof systemMessage !== 'string') {
				return Response.json({ message: 'Expected system message to be string' }, { status: 400 });
			}

			const transcript = await openAi.audio.transcriptions.create({
				model: 'whisper-1',
				file: audio,
				language: 'en',
			});

			const processedText = await openAi.chat.completions.create({
				model: 'gpt-4',
				messages: [
					{ role: 'system', content: systemMessage },
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
