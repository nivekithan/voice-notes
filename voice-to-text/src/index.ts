import { Ai } from '@cloudflare/ai';

export interface Env {
	AI: any;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		try {
			const recording = await request.arrayBuffer();

			const ai = new Ai(env.AI);

			const response = await ai.run('@cf/openai/whisper', { audio: [...new Uint8Array(recording)] });

			return Response.json({ response });
		} catch (err) {
			console.log(err);

			throw err;
		}
	},
};
