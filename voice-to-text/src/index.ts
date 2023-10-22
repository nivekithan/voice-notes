import { OpenAI } from 'openai';

export interface Env {
	OPENAI_API_KEY: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		try {
			const openAi = new OpenAI({ apiKey: env.OPENAI_API_KEY });

			const arrayBuffer = await request.arrayBuffer();
			const file = new File([arrayBuffer], 'audio.wav');

			const transcript = await openAi.audio.transcriptions.create({ model: 'whisper-1', file: file });
			const response = transcript.text;

			return Response.json({ response });
		} catch (err) {
			console.log(err);

			throw err;
		}
	},
};
