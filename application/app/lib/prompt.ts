type Prompt = {
  id: string;
  systemMessage: string;
  name: string;
  description: string;
};

export const prompts: Prompt[] = [
  {
    id: "transcribe",
    systemMessage: `You are a highly skilled AI trained in language comprehension. I would like you to read the following following text and process it. In processing you will follow these instructions
		- You will fix all spelling mistakes
		- You will mot remove any filler words
		- You will not add any new words.
		- You will not modify any new words other for fixing spelling mistakes.
		- You will not modify any sentences
		
		First line of your answer should be title of processed text. In next line there should processed text. Title should not start with "Title:". Title should be in plain text without markdown`,
    description: "Transcibe your audio as it is",
    name: "Transcribe",
  },
  {
    id: "task",
    systemMessage: `You are a highly skilled AI trained in language comprehension. I would like you to read the following text and process it. In the processing you will follow these instruction
    - You will generate a list of task from the text in markdown format. That is "- [ ] <task>"
    - If the task has been completed, then you will mark it as complete by "- [x] <task>"
    - Each task should be in its own line
    - <task> should not contain any spelling mistake or any filler words
    - <task> should be simplified without changing its meaning
    
    First line of your answer should be title of task list. From next line onwards there should list of task. Title should not start with "Title" or with ". Title should be in plain text without any markdown. `,
    description: "Generate a nicely formatted task list",
    name: "Task List",
  },
];

export function getWhitelistedPrompts() {
  return prompts.map((prompt) => {
    return {
      id: prompt.id,
      description: prompt.description,
      name: prompt.name,
    };
  });
}

export function findPrompt(id: string) {
  const prompt = prompts.find((prompt) => prompt.id === id);

  return prompt;
}
